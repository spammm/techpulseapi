import {
  Controller,
  Get,
  Post as PostMethod,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Put,
  Query,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from '../types/request-with-user.interface';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';
import * as fs from 'fs/promises';
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

  // @Get()
  // async findAll(
  //   @Query('page') page = 1,
  //   @Query('limit') limit = 10,
  // ): Promise<{ posts: Post[]; totalPages: number }> {
  //   const [posts, count] = await this.postsService.findAllWithCount();

  //   const totalPages = Math.ceil(count / limit);
  //   const paginatedPosts = posts.slice((page - 1) * limit, page * limit);

  //   return {
  //     posts: paginatedPosts,
  //     totalPages,
  //   };
  // }

  @Patch('increment-view/:id')
  async incrementViewCount(@Param('id') id: string): Promise<void> {
    await this.postsService.incrementViewCount(parseInt(id, 10));
  }

  @PostMethod('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', '..', 'uploads', 'tmp'),
        filename: (req, file, cb) => {
          const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueSuffix);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype.match(
            /\/(jpg|jpeg|png|gif|webp|tiff|avif|svg|bmp|heif|heic|ico)$/,
          )
        ) {
          cb(null, true);
        } else {
          cb(new Error('Unsupported file type'), false);
        }
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const tmpPath = join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'tmp',
      file.filename,
    );

    const newFileName = `${uuidv4()}.webp`;
    const outputDir = join(__dirname, '..', '..', '..', 'uploads', 'images');
    const outputPath = join(outputDir, newFileName);

    try {
      await fs.mkdir(outputDir, { recursive: true });
      const image = sharp(tmpPath);
      const metadata = await image.metadata();

      sharp.cache(false);

      const buffer = await image
        .resize({
          width: metadata.width > 1920 ? 1920 : undefined,
          height: metadata.height > 1080 ? 1080 : undefined,
          fit: 'inside',
        })
        .webp({ quality: 80 })
        .toBuffer();

      await fs.writeFile(outputPath, buffer);

      await fs.unlink(tmpPath);

      const relativePath = `uploads/images/${newFileName}`;

      return {
        filename: newFileName,
        path: `/${relativePath.replace(/\\/g, '/')}`,
      };
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Error processing image');
    }
  }
}
