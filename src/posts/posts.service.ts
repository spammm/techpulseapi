import { slugify } from 'transliteration';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {
    //console.log('PostsRepository:', this.postsRepository);
  }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    console.log('DTO received in create:', createPostDto);

    let url = slugify(createPostDto.title);

    let existingPost = await this.postsRepository.findOne({ where: { url } });
    while (existingPost) {
      url = `${url}-${Math.floor(Math.random() * 1000)}`;
      existingPost = await this.postsRepository.findOne({ where: { url } });
    }

    const post = this.postsRepository.create({
      ...createPostDto,
      url,
    });

    console.log('Entity before saving:', post);
    return await this.postsRepository.save(post);
  }

  async delete(id: string): Promise<void> {
    const result = await this.postsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  async update(id: string, updatePostDto: CreatePostDto): Promise<Post> {
    await this.postsRepository.update(id, updatePostDto);
    const updatedPost = await this.postsRepository.findOneBy({
      id: parseInt(id, 10),
    });
    if (!updatedPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return updatedPost;
  }

  async findAllWithCount(): Promise<[Post[], number]> {
    const [data, count] = await this.postsRepository.findAndCount();
    return [data, count];
  }

  findOne(id: string): Promise<Post> {
    return this.postsRepository.findOneBy({ id: parseInt(id, 10) });
  }

  async findOneByField(
    fieldName: keyof Post,
    fieldValue: string,
  ): Promise<Post> {
    const query = {};
    query[fieldName] = fieldValue;
    const post = await this.postsRepository.findOne({ where: query });

    if (!post) {
      throw new NotFoundException(
        `Post with ${fieldName}=${fieldValue} not found`,
      );
    }

    return post;
  }
}
