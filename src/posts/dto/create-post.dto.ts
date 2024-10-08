export class CreatePostDto {
  title: string;
  subtitle: string;
  keywords?: string;
  content: string;
  tags: string[];
  sources: { name: string; link: string }[];
  showAuthorName?: boolean;
  authorName?: string;
}
