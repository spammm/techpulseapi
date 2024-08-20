import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag } from './tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  providers: [TagsService],
  controllers: [TagsController],
})
export class TagsModule {}
