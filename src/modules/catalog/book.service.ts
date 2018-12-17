import { badData, notFound } from "boom";
import Author from "../../models/Author";
import Book from "../../models/Book";
import Category from "../../models/Category";
import { IBook } from "./catalog.contracts";

class BookService {
  async getById(bookId = "") {
    const book = await Book.findByPrimary(bookId, {
      include: [Category, Author]
    });

    if (!book) {
      throw notFound("Book not found.");
    }

    return book;
  }

  async create(bookData: Partial<IBook>) {
    const bookModel = Book.build(bookData);

    try {
      await bookModel.validate();
    } catch (error) {
      throw badData("Failed validation", error);
    }

    try {
      const createdBook = await bookModel.save();
      return this.getById(createdBook.id);
    } catch (error) {
      throw badData("Failed validation", error);
    }
  }

  async edit(bookId = "", bookData: Partial<IBook> = {}) {
    const bookToEdit = await this.getById(bookId);

    for (const key in bookData) {
      if (bookData.hasOwnProperty(key) && typeof bookData[key] !== undefined) {
        bookToEdit.set(key, bookData[key]);
      }
    }

    try {
      const updatedBook = await bookToEdit.save();
      return this.getById(updatedBook.id);
    } catch (error) {
      throw badData("Failed validation", error);
    }
  }

  async remove(bookId = "") {
    const bookToRemove = await this.getById(bookId);

    try {
      await bookToRemove.destroy();
      return bookToRemove;
    } catch (error) {
      throw badData("Failed validation", error);
    }
  }
}

export default new BookService();
