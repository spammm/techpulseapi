import { slugify } from 'transliteration';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from '../users/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, user: User): Promise<Post> {
    let url = slugify(createPostDto.title);

    let existingPost = await this.postsRepository.findOne({ where: { url } });
    while (existingPost) {
      url = `${url}-${Math.floor(Math.random() * 1000)}`;
      existingPost = await this.postsRepository.findOne({ where: { url } });
    }

    const post = this.postsRepository.create({
      ...createPostDto,
      url,
      owner: user,
      authorName: createPostDto.authorName || user.publicAlias || '',
    });

    const insertResult = await this.postsRepository.insert(post);

    const savedPost = await this.postsRepository.findOne({
      where: { id: insertResult.identifiers[0].id },
    });

    return savedPost;
  }

  async delete(id: string): Promise<void> {
    const result = await this.postsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  async update(id: string, updatePostDto: CreatePostDto): Promise<Post> {
    const post = await this.postsRepository.findOneBy({ id: parseInt(id, 10) });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    Object.assign(post, updatePostDto);
    const updatedPost = await this.postsRepository.save(post);

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
