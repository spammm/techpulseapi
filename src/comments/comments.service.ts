import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '../users/user.entity';
import { Post } from '../posts/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    user: User,
  ): Promise<Comment> {
    const post = await this.postsRepository.findOne({
      where: { id: createCommentDto.postId },
    });

    if (!post) {
      throw new NotFoundException(
        `Post with ID ${createCommentDto.postId} not found`,
      );
    }

    const comment = this.commentsRepository.create({
      content: createCommentDto.content,
      user,
      post,
      published: createCommentDto.published || true,
      createdAt: new Date(),
    });

    return this.commentsRepository.save(comment);
  }

  async findAll(
    published: 'all' | 'published' | 'unpublished',
    moderated: 'all' | 'moderated' | 'unmoderated',
    searchTerm: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<Comment[]> {
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (published === 'published') {
      whereClause.published = true;
    } else if (published === 'unpublished') {
      whereClause.published = false;
    }

    if (moderated === 'moderated') {
      whereClause.moderated = true;
    } else if (moderated === 'unmoderated') {
      whereClause.moderated = false;
    }

    if (searchTerm) {
      whereClause.content = ILike(`%${searchTerm}%`);
    }

    return this.commentsRepository.find({
      where: whereClause,
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
    });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return comment;
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.findOne(id);
    Object.assign(comment, updateCommentDto);
    return this.commentsRepository.save(comment);
  }

  async remove(id: number): Promise<void> {
    const result = await this.commentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
  }

  async findAllByPost(
    postId: number,
    userRole?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<Comment[]> {
    const skip = (page - 1) * limit;

    const whereClause = {
      post: { id: postId },
      ...(userRole !== 'admin' &&
      userRole !== 'manager' &&
      userRole !== 'writer'
        ? { published: true }
        : {}),
    };

    return this.commentsRepository.find({
      where: whereClause,
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      select: {
        user: {
          id: true,
          firstName: true,
          publicAlias: true,
        },
        post: {
          id: true,
          title: true,
          url: true,
        },
      },
    });
  }

  async findAllByUser(userId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'post'],
    });
  }

  async findAllUnpublished(): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { published: false },
      relations: ['user', 'post'],
    });
  }
}
