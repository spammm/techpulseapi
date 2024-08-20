import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const { password } = registerDto;
    const hashedPassword = await this.hashPassword(password);

    const newUser = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      role: 'user',
    });

    return newUser;
  }

  async registerAdmin(registerDto: RegisterDto): Promise<User> {
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

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '20h' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '180d' }),
    };
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findByUsername(payload.username);

      if (!user) {
        throw new Error('User not found');
      }

      const newPayload = {
        username: user.username,
        sub: user.id,
        role: user.role,
      };
      return this.jwtService.sign(newPayload, { expiresIn: '20h' });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
