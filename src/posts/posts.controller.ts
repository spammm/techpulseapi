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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';
import * as fs from 'fs/promises';
import { Post } from './post.entity';
import { RequestWithUser } from '../types/request-with-user.interface';

@Controller('posts')
@UseGuards(AuthGuard('jwt'))
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @PostMethod()
  async create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: RequestWithUser,
  ) {
    return this.postsService.create(createPostDto, req.user);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePostDto: CreatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @PostMethod('upload')
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

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.postsService.delete(id);
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<{ posts: Post[]; totalPages: number }> {
    const [posts, count] = await this.postsService.findAllWithCount();

    const totalPages = Math.ceil(count / limit);
    const paginatedPosts = posts.slice((page - 1) * limit, page * limit);

    return {
      posts: paginatedPosts,
      totalPages,
    };
  }

  @Get('find')
  async findOneByField(
    @Query('fieldName') fieldName: keyof Post,
    @Query('fieldValue') fieldValue: string,
  ) {
    return this.postsService.findOneByField(fieldName, fieldValue);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }
}
