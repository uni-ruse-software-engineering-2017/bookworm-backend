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

export interface IContentFileMetadata {
  id?: string;
  name: string;
  url: string;
  extension: string;
  sizeInBytes: number;
  isPreview: boolean;
  bookId: string;
  book?: IBook;
}

export interface IUploadedFileMetadata {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModifiedDate: Date;
}
