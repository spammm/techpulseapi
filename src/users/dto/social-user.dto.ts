import { IsEmail, IsString } from 'class-validator';

export class SocialUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  provider: string;

  @IsString()
  providerId: string;
}
