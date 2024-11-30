import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as sharp from 'sharp';
import * as fs from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { PostImage } from './post-image.entity';
import { UpdateImageDto } from './dto/create-post-image.dto';
import { Post } from '../posts/post.entity';

@Injectable()
export class PostImageService {
  constructor(
    @InjectRepository(PostImage)
    private readonly imageRepository: Repository<PostImage>,
  ) {}

  async findByPostId(postId: number): Promise<PostImage[]> {
    return this.imageRepository.find({
      where: { post: { id: postId } },
    });
  }

  async updateImage(
    id: number,
    updateImageDto: UpdateImageDto,
  ): Promise<PostImage> {
    const image = await this.imageRepository.findOne({
      where: { id },
    });
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    Object.assign(image, updateImageDto);
    return this.imageRepository.save(image);
  }

  async create(imageData: Partial<PostImage>): Promise<PostImage> {
    const image = this.imageRepository.create(imageData);
    return this.imageRepository.save(image);
  }

  async deleteByPostId(postId: string): Promise<void> {
    const images = await this.imageRepository.find({
      where: { post: { id: parseInt(postId, 10) } },
    });

    if (images.length === 0) {
      throw new NotFoundException(`No images found for post with ID ${postId}`);
    }

    await this.imageRepository.remove(images);
  }

  async processImage(
    file: Express.Multer.File,
    postId: number,
    apiUrl: string,
    user: any,
  ): Promise<PostImage> {
    const tmpPath = this.getTempFilePath(file.filename);
    const hashName = uuidv4();
    const newFileName = `${hashName}.webp`;
    const smallFileName = `${hashName}_small.webp`;
    const outputDir = this.getOutputDir();
    const outputPath = join(outputDir, newFileName);
    const smallOutputPath = join(outputDir, smallFileName);

    try {
      await this.prepareDirectory(outputDir);
      const image = sharp(tmpPath);
      const metadata = await image.metadata();
      sharp.cache(false);

      const largeBuffer = await this.createImageVersion(
        image,
        metadata,
        1920,
        1080,
      );
      await fs.writeFile(outputPath, largeBuffer);

      const smallBuffer = await this.createImageVersion(
        image,
        metadata,
        640,
        480,
      );
      await fs.writeFile(smallOutputPath, smallBuffer);

      await fs.unlink(tmpPath);

      const relativePath = `uploads/images/${newFileName}`;
      const smallRelativePath = `uploads/images/${smallFileName}`;

      const smallMetadata = await sharp(smallBuffer).metadata();

      return this.saveImage(
        file,
        apiUrl,
        postId,
        user,
        relativePath,
        smallRelativePath,
        metadata,
        smallMetadata,
      );
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Error processing image');
    }
  }

  async uploadGifImage(
    file: Express.Multer.File,
    postId: number,
    apiUrl: string,
    user: any,
  ): Promise<PostImage> {
    const tmpPath = this.getTempFilePath(file.filename);
    const hashName = uuidv4();
    const newFileName = `${hashName}.gif`;
    const smallFileName = `${hashName}_small.gif`;
    const outputDir = this.getOutputDir();
    const outputPath = join(outputDir, newFileName);
    const smallOutputPath = join(outputDir, smallFileName);

    try {
      await this.prepareDirectory(outputDir);

      await fs.copyFile(tmpPath, outputPath);
      await fs.copyFile(tmpPath, smallOutputPath);

      await fs.unlink(tmpPath);

      const relativePath = `uploads/images/${newFileName}`;
      const smallRelativePath = `uploads/images/${smallFileName}`;

      const metadata = await sharp(outputPath).metadata();
      const smallMetadata = await sharp(smallOutputPath).metadata();

      return this.saveImage(
        file,
        apiUrl,
        postId,
        user,
        relativePath,
        smallRelativePath,
        metadata,
        smallMetadata,
      );
    } catch (error) {
      console.error('Error processing GIF image:', error);
      throw new Error('Error processing GIF image');
    }
  }

  private async prepareDirectory(directory: string): Promise<void> {
    await fs.mkdir(directory, { recursive: true });
  }

  private getTempFilePath(filename: string): string {
    return join(__dirname, '..', '..', '..', 'uploads', 'tmp', filename);
  }

  private getOutputDir(): string {
    return join(__dirname, '..', '..', '..', 'uploads', 'images');
  }

  private async createImageVersion(
    image: sharp.Sharp,
    metadata: sharp.Metadata,
    maxWidth: number,
    maxHeight: number,
  ): Promise<Buffer> {
    return image
      .resize({
        width: metadata.width > maxWidth ? maxWidth : undefined,
        height: metadata.height > maxHeight ? maxHeight : undefined,
        fit: 'inside',
      })
      .webp({ quality: 80 })
      .toBuffer();
  }

  private async saveImage(
    file: Express.Multer.File,
    apiUrl: string,
    postId: number,
    user: any,
    relativePath: string,
    smallRelativePath: string,
    metadata: sharp.Metadata,
    smallMetadata: sharp.Metadata,
  ): Promise<PostImage> {
    return this.imageRepository.save({
      src: `${apiUrl}/${relativePath.replace(/\\/g, '/')}`,
      smallSrc: `${apiUrl}/${smallRelativePath.replace(/\\/g, '/')}`,
      alt: file.originalname,
      width: metadata.width,
      height: metadata.height,
      smallWidth: smallMetadata.width,
      smallHeight: smallMetadata.height,
      owner: user,
      post: { id: postId } as Post,
    });
  }
}
