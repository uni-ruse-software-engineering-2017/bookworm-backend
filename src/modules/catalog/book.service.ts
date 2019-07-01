import { badData, notFound } from "boom";
import { Sequelize } from "sequelize-typescript";
import Book from "../../models/Book";
import logger from "../../services/logger";
import paginate, {
  IPaginatedResource,
  IPaginationQuery
} from "../../services/paginate";
import { IBook, IBookListItem } from "./catalog.contracts";

class BookService {
  async getAll(query: IPaginationQuery<Book>) {
    const books: IPaginatedResource<IBookListItem> = await paginate(Book, {
      sortColumn: "created_at",
      sortOrder: "DESC",
      ...query,
      scope: "listItem"
    });
    return books;
  }

  async getAllByCategoryId(categoryId: string, query: IPaginationQuery<Book>) {
    const books: IPaginatedResource<IBookListItem> = await paginate(Book, {
      sortColumn: "created_at",
      sortOrder: "DESC",
      ...query,
      where: { ...query.where, categoryId: categoryId },
      scope: "listItem"
    });

    return books;
  }

  async getById(bookId: string) {
    const book = await Book.scope("detailed")
      .findByPk(bookId)
      .catch(error => {
        logger.error(error);
        Promise.resolve(null);
      });

    if (!book) {
      throw notFound("Book not found.");
    }

    return book;
  }

  async create(bookData: Partial<IBook>) {
    const bookModel = Book.build({ ...bookData, id: undefined });

    try {
      await bookModel.validate();
    } catch (error) {
      throw badData("Validation failed.", error);
    }

    try {
      const createdBook = await bookModel.save();
      return this.getById(createdBook.id);
    } catch (error) {
      throw badData("Validation failed.", error);
    }
  }

  async edit(bookId = "", bookData: Partial<IBook> = {}) {
    const bookToEdit = await this.getById(bookId);

    let key: keyof IBook;
    for (key in bookData) {
      if (bookData.hasOwnProperty(key) && typeof bookData[key] !== undefined) {
        bookToEdit.set(key, bookData[key]);
      }
    }

    try {
      const updatedBook = await bookToEdit.save();
      return this.getById(updatedBook.id);
    } catch (error) {
      throw badData("Validation failed.", error);
    }
  }

  async remove(bookId = "") {
    const bookToRemove = await this.getById(bookId);

    try {
      await bookToRemove.destroy();
      return bookToRemove;
    } catch (error) {
      throw badData("Validation failed.", error);
    }
  }

  async getFeaturedBooks() {
    const featuredBooks = await Book.scope("listItem").findAll({
      where: {
        featured: true
      },
      limit: 10,
      order: Sequelize.literal("random()")
    });

    return featuredBooks;
  }

  async getLatestBooks() {
    const latestBooks = await paginate(Book, {
      page: 1,
      pageSize: 10,
      sortColumn: "created_at",
      sortOrder: "DESC"
    });

    return latestBooks;
  }
}

export default new BookService();
