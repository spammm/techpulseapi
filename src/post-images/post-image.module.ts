import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostImage } from './post-image.entity';
import { PostImageService } from './post-image.service';
import { PostImageController } from './post-image.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PostImage])],
  providers: [PostImageService],
  controllers: [PostImageController],
  exports: [PostImageService],
})
export class PostImageModule {}
