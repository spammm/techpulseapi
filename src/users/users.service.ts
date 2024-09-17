import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    user.password = '';
    return user;
  }

  async checkUsernameExists(username: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { username } });
    return !!user;
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return !!user;
  }

  async create(user: Partial<User>): Promise<User> {
    // Проверка уникальности username
    if (user.username) {
      const existingUserByUsername = await this.usersRepository.findOne({
        where: { username: user.username },
      });
      if (existingUserByUsername) {
        throw new ConflictException('Username уже используется');
      }
    }

    // Проверка уникальности email
    if (user.email) {
      const existingUserByEmail = await this.usersRepository.findOne({
        where: { email: user.email },
      });
      if (existingUserByEmail) {
        throw new ConflictException('Email уже используется');
      }
    }

    // Создание нового пользователя
    const newUser = this.usersRepository.create(user);
    return this.usersRepository.save(newUser);
  }

  async update(id: number, updatedData: Partial<User>): Promise<User> {
    if (updatedData.username) {
      const existingUserByUsername = await this.usersRepository.findOne({
        where: { username: updatedData.username },
      });
      if (existingUserByUsername && existingUserByUsername.id !== id) {
        throw new ConflictException(
          'Username уже используется другим пользователем',
        );
      }
    }

    if (updatedData.email) {
      const existingUserByEmail = await this.usersRepository.findOne({
        where: { email: updatedData.email },
      });
      if (existingUserByEmail && existingUserByEmail.id !== id) {
        throw new ConflictException(
          'Email уже используется другим пользователем',
        );
      }
    }

    await this.usersRepository.update(id, updatedData);

    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
