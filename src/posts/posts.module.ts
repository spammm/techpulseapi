import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './post.entity';
import { HttpModule } from '@nestjs/axios';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), HttpModule, ServicesModule],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
