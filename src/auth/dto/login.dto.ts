import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  username: string;

  @IsString()
  password: string;
}

export class ClientLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
