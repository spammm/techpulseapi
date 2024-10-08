import { slugify } from 'transliteration';
import { Repository, MoreThan, LessThan, Brackets } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from '../users/user.entity';
import { HttpService } from '@nestjs/axios';
import { GoogleIndexingService } from '../services/google-indexing.service';
import { TelegramService } from 'src/services/telegram-service';

const clientSiteUrl = process.env.CLIENT_URL;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly httpService: HttpService,
    private readonly googleIndexingService: GoogleIndexingService,
    private readonly telegramService: TelegramService,
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
    const createdPost = await this.postsRepository.findOne({
      where: { id: insertResult.identifiers[0].id },
    });

    return createdPost;
  }

  private async triggerSitemapUpdate() {
    try {
      const response = await lastValueFrom(
        this.httpService.get(
          `${process.env.CLIENT_URL}/api/clear-sitemap-cache`,
          {
            headers: {
              'x-sitemap-secret': process.env.SITEMAP_SECRET,
            },
          },
        ),
      );
      console.log('Sitemap cache cleared successfully', response.data);

      if (!process.env.CLIENT_URL.includes('localhost')) {
        const yandexPingUrl = `https://webmaster.yandex.ru/ping?sitemap=${process.env.CLIENT_URL}/sitemap.xml`;
        const yandexPingResponse = await lastValueFrom(
          this.httpService.get(yandexPingUrl),
        );
        console.log('Yandex ping successful', yandexPingResponse.data);
      }
    } catch (error) {
      console.error(
        'Failed to clear sitemap cache or send index request',
        error,
      );
    }
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

    const wasPublished = post.published;

    Object.assign(post, updatePostDto);
    const updatedPost = await this.postsRepository.save(post);
    const updatedPostUrl = `${clientSiteUrl}/news/${post.url}`;

    if (!wasPublished && updatedPost.published) {
      await this.triggerSitemapUpdate();
      if (process.env.GOOGLE_PRIVATE_KEY) {
        await this.googleIndexingService.requestGoogleIndexing(
          updatedPostUrl,
          'URL_UPDATED',
        );
      }
      await this.triggerSitemapUpdate();
      //telegram
      if (telegramChatId !== undefined) {
        const message = `<b>${updatedPost.title}</b>\n${updatedPost.subtitle || ''}\n\nЧитать полностью:\n${clientSiteUrl}/news/${updatedPost.url}`;
        const messageId =
          await this.telegramService.sendMessageToChannel(message);

        Object.assign(updatedPost, updatePostDto);
        updatedPost.telegramMessageId = messageId;
        await this.postsRepository.save(updatedPost);
      }
    } else if (wasPublished && !updatedPost.published) {
      await this.triggerSitemapUpdate();
      if (process.env.GOOGLE_PRIVATE_KEY) {
        await this.googleIndexingService.requestGoogleIndexing(
          updatedPostUrl,
          'URL_DELETED',
        );
      }
      //teleram
      if (telegramChatId !== undefined && updatedPost?.telegramMessageId) {
        await this.telegramService.deleteMessageFromChannel(
          updatedPost.telegramMessageId,
        );
      }
    }

    return updatedPost;
  }

  async findAllWithCount(): Promise<[Post[], number]> {
    return await this.postsRepository.findAndCount();
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

  async fetchPosts(
    page: number,
    limit: number,
    search?: string,
    tags?: string[],
    author?: string,
    published?: 'published' | 'unpublished' | 'all',
  ): Promise<{ posts: Post[]; totalPages: number }> {
    const take = limit;
    const skip = (page - 1) * take;

    const query = this.postsRepository
      .createQueryBuilder('post')
      .orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('post.title ILIKE :search', {
            search: `%${search}%`,
          })
            .orWhere('post.subtitle ILIKE :search', { search: `%${search}%` })
            .orWhere('post.content ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (tags && tags.length > 0) {
      query.andWhere(
        new Brackets((qb) => {
          tags.forEach((tag) => {
            qb.orWhere('post.tags ILIKE :tag', {
              tag: `%${tag}%`,
            });
          });
        }),
      );
    }

    if (author) {
      query.andWhere('post.authorName = :author', { author });
    }

    if (published) {
      query.andWhere('post.published = :published', {
        published: published === 'published',
      });
    }

    const [posts, total] = await query.getManyAndCount();
    const totalPages = Math.ceil(total / take);

    return { posts, totalPages };
  }

  async getPopularPosts(): Promise<Post[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return this.postsRepository.find({
      where: {
        published: true,
        publishedAt: MoreThan(oneWeekAgo),
      },
      order: {
        viewCount: 'DESC',
      },
      take: 5,
    });
  }

  async getPostByUrl(url: string): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { url } });
    if (!post) {
      console.error('Post not found for URL:', url);
      throw new NotFoundException('Post not found');
    }
    await this.postsRepository.save(post);
    return post;
  }

  async getAdjacentPosts(
    postId: number,
  ): Promise<{ prevPostUrl?: string; nextPostUrl?: string }> {
    const currentPost = await this.postsRepository.findOne({
      where: { id: postId },
    });

    if (!currentPost) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const prevPost = await this.postsRepository.findOne({
      where: {
        publishedAt: LessThan(currentPost.publishedAt),
        published: true,
      },
      order: { publishedAt: 'DESC' },
    });

    const nextPost = await this.postsRepository.findOne({
      where: {
        publishedAt: MoreThan(currentPost.publishedAt),
        published: true,
      },
      order: { publishedAt: 'ASC' },
    });

    return {
      prevPostUrl: prevPost?.url,
      nextPostUrl: nextPost?.url,
    };
  }

  async incrementViewCount(id: number): Promise<void> {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    post.viewCount += 1;
    await this.postsRepository.save(post);
  }
}
