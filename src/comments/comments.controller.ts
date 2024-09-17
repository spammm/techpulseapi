import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
  ParseIntPipe,
  Query,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { RequestWithUser } from '../types/request-with-user.interface';
import { Comment } from './comment.entity';

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
  async findAll(
    @Query('published') published: 'all' | 'published' | 'unpublished' = 'all',
    @Query('moderated') moderated: 'all' | 'moderated' | 'unmoderated' = 'all',
    @Query('search') searchTerm: string = '',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.commentsService.findAll(
      published,
      moderated,
      searchTerm,
      page,
      limit,
    );
  }

  @Get(':id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id', new ParseIntPipe()) id: number) {
    return this.commentsService.remove(id);
  }

  @Get('post/:postId')
  async getCommentsByPostId(
    @Param('postId') postId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('role') role: string = 'guest',
  ): Promise<Comment[]> {
    return this.commentsService.findAllByPost(postId, role, page, limit);
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
