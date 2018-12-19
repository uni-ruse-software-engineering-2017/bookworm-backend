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

export interface IAuthor {
  id?: number;
  name: string;
  biography: string;
  birthDate: Date;
  books?: IBook[];
}

export interface ICategory {
  id?: string;
  name: string;
  seoUrl: string;
  parent?: ICategory | null;
  parentId?: string | null;
  children?: ICategory[];
}
