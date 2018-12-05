import Author from "../../models/Author";
import Book from "../../models/Book";
import paginate from "../../services/paginate";

export interface IAuthor {
  id?: number;
  name: string;
  biography: string;
  birthDate: Date;
  books?: Book[];
}

class AuthorService {
  async getAll({ page = 1, pageSize = 25 } = {}) {
    return paginate(Author, { page, pageSize });
  }

  async create(authorData: IAuthor) {
    const author = await Author.create(authorData);
    return author;
  }

  async getById(id: string): Promise<Author | null> {
    const author = await Author.findById(id);
    return author;
  }
}

export default new AuthorService();
