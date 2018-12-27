import { badData, notFound } from "boom";
import Author from "../../models/Author";
import paginate from "../../services/paginate";
import { IAuthor } from "./catalog.contracts";

class AuthorService {
  async getAll({ page = 1, pageSize = 25 } = {}) {
    return paginate(Author, { page, pageSize });
  }

  async create(authorData: IAuthor) {
    try {
      const author = await Author.create(authorData);
      return author;
    } catch (error) {
      throw badData("Validation failed.", error.errors || error);
    }
  }

  async getById(id: string): Promise<Author | null> {
    const author = await Author.scope("detailed").findByPrimary(id);
    return author;
  }

  async edit(id: string, data: Partial<IAuthor> = {}) {
    const author = await Author.findByPrimary(id);

    if (!author) {
      throw notFound("Author not found.");
    }

    // nothing to update
    if ((Object.keys(data).length = 0)) {
      return author;
    }

    if (data.name) {
      author.name = data.name;
    }

    if (data.biography) {
      author.biography = data.biography;
    }

    if (data.birthDate) {
      author.birthDate = data.birthDate;
    }

    try {
      const updatedAuthor = await author.save();
      return updatedAuthor;
    } catch (error) {
      throw badData(error, error.errors);
    }
  }

  async remove(id: string): Promise<Author | null> {
    const author = await Author.findByPrimary(id);
    if (author) {
      await author.destroy();
      return author;
    }

    return null;
  }
}

export default new AuthorService();
