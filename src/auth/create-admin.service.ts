import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

import * as bcrypt from 'bcrypt';

@Injectable()
export class CreateAdminService {
  constructor(private readonly usersService: UsersService) {}

  async createAdmin() {
    const adminExists = await this.usersService.findByUsername('admin');

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('1', 10);
      await this.usersService.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  }
}
