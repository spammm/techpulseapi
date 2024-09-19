import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { EmailService } from '../services/email.service';
import { AdminRegisterDto, ClientRegisterDto } from './dto/register.dto';
import { TokenExpiredException } from '../exceptions/token-expired.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  clientSiteUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  private generateRandomPassword(length: number = 12): string {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async generateEmailConfirmationToken(user: User): Promise<string> {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload, { expiresIn: '24h' });
  }

  async register(registerDto: AdminRegisterDto): Promise<User> {
    const { password, role } = registerDto;
    const hashedPassword = await this.hashPassword(password);

    const newUser = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      role: role || 'user',
    });

    return newUser;
  }

  async registerClient(registerDto: ClientRegisterDto): Promise<User> {
    const { email, password, firstName, lastName } = registerDto;

    // Проверяем, существует ли пользователь с данным email
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException(
        'Пользователь с таким email уже существует.',
      );
    }

    let generatedPassword: string | null = null;
    let hashedPassword: string | null = null;

    if (!password) {
      generatedPassword = this.generateRandomPassword(12);
      hashedPassword = await this.hashPassword(generatedPassword);
    } else {
      hashedPassword = await this.hashPassword(password);
    }

    const newUser = await this.usersService.create({
      email,
      password: hashedPassword,
      role: 'client',
      firstName,
      lastName,
      //если регистрация через соц сеть, то email считается подтвержденным
      isEmailConfirmed: generatedPassword ? true : false,
    });

    // Отправка email пользователю
    if (generatedPassword) {
      await this.emailService.sendEmail(
        email,
        'Добро пожаловать на TechPulse!',
        'welcome',
        { password: generatedPassword, link: this.clientSiteUrl },
      );
    } else {
      await this.sendConfirmationEmail(newUser);
    }

    return newUser;
  }

  async confirmEmail(token: string): Promise<void> {
    let payload: any;
    try {
      // Декодируем токен для извлечения email
      payload = this.jwtService.decode(token);

      // Проверяем и подтверждаем токен
      this.jwtService.verify(token);

      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      user.isEmailConfirmed = true;
      await this.usersService.update(user.id, user);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new TokenExpiredException('TokenExpiredError', payload.email);
      } else {
        throw new Error('Невалидный токен');
      }
    }
  }

  async resendConfirmationEmail(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Пользователь с таким email не найден');
    }

    if (user.isEmailConfirmed) {
      throw new BadRequestException('Email уже подтвержден');
    }

    // Генерация нового токена и отправка письма
    await this.sendConfirmationEmail(user);
  }

  async sendConfirmationEmail(user: User): Promise<void> {
    const confirmationToken = this.jwtService.sign(
      { email: user.email, sub: user.id },
      { expiresIn: '24h' }, // Срок действия токена
    );

    const confirmationUrl = `${this.clientSiteUrl}/confirm-email?token=${confirmationToken}`;
    await this.emailService.sendEmail(
      user.email,
      'Подтверждение вашей электронной почты на TechPulse!',
      'confirm-email',
      { confirmationUrl, link: this.clientSiteUrl },
    );
  }

  async registerAdmin(registerDto: AdminRegisterDto): Promise<User> {
    const { password } = registerDto;
    const hashedPassword = await this.hashPassword(password);

    const newAdmin = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      role: 'admin',
    });

    return newAdmin;
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    if (updateData.password) {
      updateData.password = await this.hashPassword(updateData.password);
    }
    return this.usersService.update(id, updateData);
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateClient(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      if (!user.isEmailConfirmed) {
        throw new UnauthorizedException('Пожалуйста, подтвердите вашу почту.');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };
    // Время жизни accessToken в миллисекундах
    const accessTokenExpiresIn = 5 * 1000;

    const accessToken = this.jwtService.sign(payload, { expiresIn: '5m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '180d' });
    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      let user: User;

      if (payload.username) {
        user = await this.usersService.findByUsername(payload.username);
      } else if (payload.email) {
        user = await this.usersService.findByEmail(payload.email);
      }

      if (!user) {
        throw new Error('User not found');
      }

      const newPayload = {
        username: user.username,
        sub: user.id,
        role: user.role,
      };
      // Время жизни accessToken в миллисекундах
      const accessTokenExpiresIn = 5 * 1000;
      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: '5m',
      });
      return {
        accessToken,
        refreshToken,
        accessTokenExpiresIn,
      };
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  async handleSocialLogin(socialData: {
    email: string;
    name: string;
    provider: string;
    providerId: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    let user = await this.usersService.findByEmail(socialData.email);

    if (!user) {
      user = await this.registerClient({
        email: socialData.email,
        firstName: socialData.name,
        password: null,
        provider: socialData.provider,
        providerId: socialData.providerId,
      });
    } else {
      // Если пользователь уже существует, проверяем, привязан ли соц аккаунт
      if (!user.provider || !user.providerId) {
        await this.updateUser(user.id, {
          provider: socialData.provider,
          providerId: socialData.providerId,
        });
      }
    }

    return this.login(user);
  }
}
