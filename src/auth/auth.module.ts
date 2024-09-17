import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as dotenv from 'dotenv';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { CreateAdminService } from './create-admin.service';
import { ServicesModule } from 'src/services/services.module';

dotenv.config();

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    ServicesModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret_key',
      signOptions: { expiresIn: '20h' },
    }),
  ],
  providers: [AuthService, JwtStrategy, CreateAdminService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
