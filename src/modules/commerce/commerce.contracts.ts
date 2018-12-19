export interface ICartLine {
  id?: string;
  bookId: string;
  title: string;
  price: number;
  coverImage: string;
  available: boolean;
  author: {
    id: string;
    name: string;
  };
}

export interface ICartContent {
  items: ICartLine[];
  total: number;
}
