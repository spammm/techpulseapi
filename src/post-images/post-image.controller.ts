import {
  Controller,
  Post as PostMethod,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  Body,
  Param,
  Patch,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from '../types/request-with-user.interface';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';
import * as fs from 'fs/promises';
import { UpdateImageDto } from './dto/create-post-image.dto';
import { PostImageService } from './post-image.service';
import { Post } from '../posts/post.entity';

@Controller('images')
export class PostImageController {
  constructor(private readonly imageService: PostImageService) {}

  @Get('/post/:postId')
  async getImagesByPostId(@Param('postId') postId: number) {
    return this.imageService.findByPostId(postId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateImage(
    @Param('id') id: number,
    @Body() updateImageDto: UpdateImageDto,
  ) {
    return this.imageService.updateImage(id, updateImageDto);
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
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('postId') postId: number,
    @Req() req: RequestWithUser,
  ) {
    const tmpPath = join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'tmp',
      file.filename,
    );

    const hashName = uuidv4();
    const newFileName = `${hashName}.webp`;
    const smallFileName = `${hashName}_small.webp`;
    const outputDir = join(__dirname, '..', '..', '..', 'uploads', 'images');
    const outputPath = join(outputDir, newFileName);
    const smallOutputPath = join(outputDir, smallFileName);

    try {
      await fs.mkdir(outputDir, { recursive: true });
      const image = sharp(tmpPath);
      const metadata = await image.metadata();

      sharp.cache(false);

      // Создание большой версии изображения
      const buffer = await image
        .resize({
          width: metadata.width > 1920 ? 1920 : undefined,
          height: metadata.height > 1080 ? 1080 : undefined,
          fit: 'inside',
        })
        .webp({ quality: 80 })
        .toBuffer();

      await fs.writeFile(outputPath, buffer);

      // Создание маленькой версии изображения
      const smallBuffer = await image
        .resize({
          width: metadata.width > 640 ? 640 : undefined,
          height: metadata.height > 480 ? 480 : undefined,
          fit: 'inside',
        })
        .webp({ quality: 80 })
        .toBuffer();

      await fs.writeFile(smallOutputPath, smallBuffer);
      await fs.unlink(tmpPath);

      const relativePath = `uploads/images/${newFileName}`;
      const smallRelativePath = `uploads/images/${smallFileName}`;

      const smallMetadata = await sharp(smallBuffer).metadata();

      return this.imageService.create({
        src: `/${relativePath.replace(/\\/g, '/')}`,
        smallSrc: `/${smallRelativePath.replace(/\\/g, '/')}`,
        alt: file.originalname,
        width: metadata.width,
        height: metadata.height,
        smallWidth: smallMetadata.width,
        smallHeight: smallMetadata.height,
        owner: req.user,
        post: { id: postId } as Post,
      });
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Error processing image');
    }
  }
}
