import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './comment.entity';
import { User } from '../users/user.entity';
import { Post } from '../posts/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, User, Post])],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
