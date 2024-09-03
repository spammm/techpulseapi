import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateImageDto {
  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  source?: string;
}
