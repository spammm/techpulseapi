import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const comment = this.commentsRepository.create(createCommentDto);
    return this.commentsRepository.save(comment);
  }

  async findAll(): Promise<Comment[]> {
    return this.commentsRepository.find({ relations: ['user', 'post'] });
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

  async findAllByPost(postId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { post: { id: postId } },
      relations: ['user', 'post'],
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
