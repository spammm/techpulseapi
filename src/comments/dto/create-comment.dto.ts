import { IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { User } from '../../users/user.entity';
import { Post } from '../../posts/post.entity';

export class CreateCommentDto {
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean = false;

  @IsNotEmpty()
  user: User;

  @IsNotEmpty()
  post: Post;
}
