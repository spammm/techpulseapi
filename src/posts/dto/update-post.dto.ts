export class CreatePostDto {
  title: string;
  subtitle: string;
  keywords?: string;
  content: string;
  tags: string[];
  imageLinks: {
    src: string;
    alt: string;
    source?: string;
    sourceUrl?: string;
  }[];
  sources: { name: string; link: string }[];
  published: boolean;
  showAuthorName?: boolean;
  authorName?: string;
  telegramMessageId?: number;
}
