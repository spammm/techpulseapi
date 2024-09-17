import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { User } from './user.entity';
import { Roles } from '../auth/roles.decorator';
import { RequestWithUser } from '../types/request-with-user.interface';
import { AuthService } from '../auth/auth.service';
import { AdminRegisterDto } from '../auth/dto/register.dto';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get('check-username')
  async checkUsernameExists(@Query('username') username: string) {
    const exists = await this.usersService.checkUsernameExists(username);
    return { exists };
  }

  @Post('register')
  async register(@Body() registerDto: AdminRegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getCurrentUser(@Req() req: RequestWithUser): Promise<User> {
    return this.usersService.findById(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(+id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'manager')
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.authService.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(+id);
  }
}
