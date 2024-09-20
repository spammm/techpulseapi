import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  SetMetadata,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientRegisterDto, AdminRegisterDto } from './dto/register.dto';
import { RolesGuard } from './roles.guard';
import { ClientLoginDto, LoginDto } from './dto/login.dto';
import { TokenExpiredException } from 'src/exceptions/token-expired.exception';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Авторизация для админки
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  // Авторизация для клиентов (по email и паролю)
  @Post('login-client')
  async loginClient(@Body() loginDto: ClientLoginDto) {
    const user = await this.authService.validateClient(
      loginDto.email,
      loginDto.password,
    );
    if (!user || user.role !== 'client') {
      throw new UnauthorizedException('Invalid credentials for client');
    }
    const authToken = await this.authService.login(user);
    return { ...user, ...authToken };
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: { refreshToken: string }) {
    const newAccessToken = await this.authService.refreshAccessToken(
      body.refreshToken,
    );
    return newAccessToken;
  }

  @Post('register')
  @UseGuards(RolesGuard)
  @SetMetadata('roles', ['admin', 'manager'])
  async register(@Body() registerDto: AdminRegisterDto) {
    return this.authService.register(registerDto);
  }

  // Регистрация клиентов
  @Post('register-client')
  async registerClient(@Body() registerDto: ClientRegisterDto) {
    return this.authService.registerClient(registerDto);
  }

  @Post('social-login')
  async socialLogin(
    @Body()
    socialData: {
      avatar: string;
      email: string;
      name: string;
      lastName: string;
      provider: string;
      providerId: string;
      accessToken: string;
    },
  ) {
    if (!socialData.email && socialData.provider === 'vk') {
      const userInfo = await this.authService.getUserInfoFromVk(
        socialData.providerId,
        socialData.accessToken,
      );
      socialData.email = userInfo?.email || '';
      socialData.name = userInfo?.first_name || socialData.name;
    }
    return this.authService.handleSocialLogin(socialData);
  }

  @Post('register-admin')
  @UseGuards(RolesGuard)
  @SetMetadata('roles', ['admin'])
  async registerAdmin(@Body() registerDto: AdminRegisterDto) {
    return this.authService.registerAdmin(registerDto);
  }

  @Post('confirm-email')
  async confirmEmail(@Body('token') token: string) {
    try {
      await this.authService.confirmEmail(token);
      return { message: 'Email успешно подтвержден' };
    } catch (error) {
      if (error instanceof TokenExpiredException) {
        throw new BadRequestException({
          message: error.message,
          email: error.email,
        });
      }

      throw new BadRequestException('Невалидный или просроченный токен');
    }
  }

  @Post('resend-confirmation-email')
  async resendConfirmationEmail(@Body('email') email: string) {
    await this.authService.resendConfirmationEmail(email);
    return { message: 'Повторное письмо с подтверждением отправлено' };
  }
}
