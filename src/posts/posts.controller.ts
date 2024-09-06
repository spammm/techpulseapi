import {
  Controller,
  Get,
  Post as PostMethod,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { RequestWithUser } from '../types/request-with-user.interface';
import { Post } from './post.entity';
import { Roles } from '../auth/roles.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @PostMethod()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: RequestWithUser,
  ) {
    return this.postsService.create(createPostDto, req.user);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updatePostDto: CreatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') id: string) {
    return this.postsService.delete(id);
  }

  @Get('url/:url')
  async getPostByUrl(@Param('url') url: string): Promise<Post> {
    return this.postsService.getPostByUrl(url);
  }

  @Get('adjacent/:id')
  async getAdjacentPosts(@Param('id') id: string) {
    const postId = parseInt(id, 10);
    return this.postsService.getAdjacentPosts(postId);
  }

  @Get('published')
  async getPublishedPosts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('tags') tags?: string[],
    @Query('author') author?: string,
  ): Promise<{ posts: Post[]; totalPages: number }> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.postsService.fetchPosts(
      pageNumber,
      limitNumber,
      search,
      tags,
      author,
      'published',
    );
  }

  @Get()
  @Roles('admin', 'manager', 'writer')
  async getAllPosts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('tags') tags?: string[],
    @Query('author') author?: string,
    @Query('published') published?: 'published' | 'unpublished',
  ): Promise<{ posts: Post[]; totalPages: number }> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.postsService.fetchPosts(
      pageNumber,
      limitNumber,
      search,
      tags,
      author,
      published,
    );
  }

  @Get('find')
  async findOneByField(
    @Query('fieldName') fieldName: keyof Post,
    @Query('fieldValue') fieldValue: string,
  ) {
    return this.postsService.findOneByField(fieldName, fieldValue);
  }

  @Get('popular')
  async getPopularPosts(): Promise<Post[]> {
    return this.postsService.getPopularPosts();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch('increment-view/:id')
  async incrementViewCount(@Param('id') id: string): Promise<void> {
    await this.postsService.incrementViewCount(parseInt(id, 10));
  }
}
