import { badData, notFound } from "boom";
import { Op } from "sequelize";
import Author from "../../models/Author";
import paginate, { IPaginationQuery } from "../../services/paginate";
import { IAuthor } from "./catalog.contracts";

class AuthorService {
  async getAll(query: IPaginationQuery<Author>) {
    return paginate(Author, query);
  }

  async create(authorData: IAuthor) {
    try {
      const author = await Author.create(authorData);
      return author;
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw badData(`Author with name ${authorData.name} already exists.`);
      } else {
        throw badData("Validation failed.", error.errors || error);
      }
    }
  }

  async getById(id: string): Promise<Author | null> {
    const author = await Author.scope("detailed").findByPrimary(id);
    return author;
  }

  async getByName(authorName: string): Promise<Author | null> {
    const author = await Author.scope("detailed").findOne({
      where: {
        name: {
          [Op.like]: authorName
        }
      }
    });
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

    if (typeof data.imageUrl !== "undefined") {
      author.imageUrl = data.imageUrl;
    }

    if (data.bornAt) {
      author.bornAt = data.bornAt;
    }

    if (typeof data.diedAt !== "undefined") {
      author.diedAt = data.diedAt;
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
