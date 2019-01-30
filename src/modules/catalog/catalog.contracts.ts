export interface IBook {
  readonly id?: string;
  isbn?: string;
  title: string;
  pages: number;
  datePublished: Date;
  summary?: string;
  price: number;
  coverImage: string;
  freeDownload: boolean;
  available: boolean;
  featured: boolean;
  authorId?: string;
  categoryId?: string;
}

export interface IBookListItem {
  readonly id: string;
  title: string;
  price: number;
  coverImage: string;
  available: boolean;
  featured: boolean;
  author: IAuthorListItem;
  category: ICategory;
}

export interface IBookDetailed extends IBook {
  author: IAuthorListItem;
  category: ICategory;
}

export interface IAuthor {
  readonly id?: string;
  name: string;
  biography: string;
  imageUrl?: string;
  bornAt: Date;
  diedAt?: Date;
  books?: IBook[];
}

export interface IAuthorListItem {
  readonly id?: string;
  name: string;
}

export interface ICategory {
  readonly id?: string;
  name: string;
  seoUrl?: string;
  parent?: ICategory | null;
  parentId?: string | null;
  children?: ICategory[];
}

export interface IContentFileMetadata {
  readonly id?: string;
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

export interface IGoodreadsAuthorSearchResponse {
  id: string;
  name: string;
  link: string;
}

export interface IGoodreadsAuthorResponse {
  id: string;
  name: string;
  link: string;
  large_image_url: string;
  image_url: string;
  small_image_url: string;
  about: string;
  influences: string;
  works_count: string;
  gender: string;
  hometown: string;
  born_at: string;
  died_at: string;
  goodreads_author: string;
}
