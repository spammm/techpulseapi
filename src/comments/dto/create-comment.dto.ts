import { IsNotEmpty, IsBoolean, IsOptional, IsInt } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean = false;

  @IsNotEmpty()
  @IsInt()
  postId: number;
}
