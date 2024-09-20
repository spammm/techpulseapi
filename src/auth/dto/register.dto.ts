import { IsEmail, IsString, IsOptional, IsIn } from 'class-validator';

export class ClientRegisterDto {
  @IsOptional()
  @IsString()
  avatar?: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  providerId?: string;
}

export class AdminRegisterDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsIn(['admin', 'manager', 'writer'])
  role: 'admin' | 'manager' | 'writer';
}
