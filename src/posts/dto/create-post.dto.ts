export class CreatePostDto {
  title: string;
  subtitle: string;
  keywords?: string;
  content: string;
  tags: string[];
  sources: { name: string; link: string }[];
  imageLinks: { src: string; alt: string }[];
  image: { src: string; alt: string };
  published: boolean;
}
