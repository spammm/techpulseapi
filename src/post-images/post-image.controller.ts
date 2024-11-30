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
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from '../types/request-with-user.interface';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UpdateImageDto } from './dto/create-post-image.dto';
import { PostImageService } from './post-image.service';

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
    const apiUrl = process.env.API_BASE_URL;

    if (extname(file.originalname).toLowerCase() === '.gif') {
      return this.imageService.uploadGifImage(file, postId, apiUrl, req.user);
    } else {
      return this.imageService.processImage(file, postId, apiUrl, req.user);
    }
  }

  @Delete('delete-by-post/:postId')
  async deleteImagesByPostId(@Param('postId') postId: string) {
    await this.imageService.deleteByPostId(postId);
    return { message: 'Images successfully deleted' };
  }
}
