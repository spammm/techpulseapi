import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostImage } from './post-image.entity';
import { UpdateImageDto } from './dto/create-post-image.dto';

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
}
