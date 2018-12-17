export interface IBook {
  id?: string;
  title: string;
  pages: number;
  datePublished: Date;
  summary?: string;
  price: number;
  coverImage: string;
  freeDownload: boolean;
  available: boolean;
  featured: boolean;
  authorId: string;
  categoryId: string;
}
