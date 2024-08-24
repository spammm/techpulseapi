import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from '../types/request-with-user.interface';
import { Comment } from './comment.entity'; // Assuming you have a Comment entity

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async addComment(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: RequestWithUser,
  ): Promise<Comment> {
    const user = req.user;
    return this.commentsService.createComment(createCommentDto, user);
  }

  @Get()
  async findAll() {
    return this.commentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.commentsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  async remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.commentsService.remove(id);
  }

  @Get('post/:postId')
  async getCommentsByPostId(
    @Param('postId', new ParseIntPipe()) postId: number,
  ): Promise<Comment[]> {
    return this.commentsService.findAllByPost(postId);
  }

  @Get('user/:userId')
  async findAllByUser(@Param('userId', new ParseIntPipe()) userId: number) {
    return this.commentsService.findAllByUser(userId);
  }

  @Get('unpublished')
  async findAllUnpublished() {
    return this.commentsService.findAllUnpublished();
  }
}
