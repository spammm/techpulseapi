import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @Get()
  async findAll() {
    return this.commentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.commentsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.commentsService.remove(id);
  }

  @Get('post/:postId')
  async findAllByPost(@Param('postId') postId: number) {
    return this.commentsService.findAllByPost(postId);
  }

  @Get('user/:userId')
  async findAllByUser(@Param('userId') userId: number) {
    return this.commentsService.findAllByUser(userId);
  }

  @Get('unpublished')
  async findAllUnpublished() {
    return this.commentsService.findAllUnpublished();
  }
}
