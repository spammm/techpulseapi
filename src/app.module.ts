import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';
import { TagsModule } from './tags/tags.module';
import { CommentsModule } from './comments/comments.module';
import { PostImageModule } from './post-images/post-image.module';
import { PostSubscriber } from './posts/post.subscriber';
import { SourcesModule } from './sources/sources.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return {
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT, 10) || 5432,
          username:
            process.env.DB_USERNAME || process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
          database: process.env.DB_DATABASE || 'your_database',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: process.env.TYPEORM_SYNC === 'true',
          logging: process.env.TYPEORM_LOGGING === 'true',
          ssl: process.env.DB_SSL === 'true',
          subscribers: [PostSubscriber],
        };
      },
    }),
    UsersModule,
    AuthModule,
    PostsModule,
    TagsModule,
    CommentsModule,
    PostImageModule,
    SourcesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
