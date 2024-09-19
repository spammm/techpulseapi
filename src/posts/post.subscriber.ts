import {
  EntitySubscriberInterface,
  EventSubscriber,
  UpdateEvent,
} from 'typeorm';
import { Post } from './post.entity';

@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Post> {
  listenTo() {
    return Post;
  }

  beforeUpdate(event: UpdateEvent<Post>) {
    const post = event.entity;
    const databasePost = event.databaseEntity;

    if (post && databasePost) {
      // Проверяем, что поле published изменилось с false на true
      if (post.published && !databasePost.published) {
        post.publishedAt = new Date();
      }
    }
  }
}
