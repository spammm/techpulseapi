// src/auth/auth.service.ts
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

  async register(registerDto: RegisterDto): Promise<User> {
    const { password } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      role: 'user',
    });

    return newUser;
  }

  async registerAdmin(registerDto: RegisterDto): Promise<User> {
    const { password } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      role: 'admin',
    });

    return newAdmin;
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
      sub: user.userId,
      role: user.role,
    };
    return {
      token: this.jwtService.sign(payload),
      role: user.role,
    };
  }
}
