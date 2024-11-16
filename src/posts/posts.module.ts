import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './post.entity';
import { HttpModule } from '@nestjs/axios';
import { ServicesModule } from '../services/services.module';
import { PostImageModule } from '../post-images/post-image.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    HttpModule,
    ServicesModule,
    PostImageModule,
  ],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
