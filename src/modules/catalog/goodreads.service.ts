import httpClient from "../../services/http-client";
import logger from "../../services/logger";
import { xmlToJSON } from "../../services/xml-parser";
import authorService from "./author.service";
import {
  IAuthor,
  IBookDetailed,
  IGoodreadsAuthorResponse,
  IGoodreadsAuthorSearchResponse
} from "./catalog.contracts";

const API_URL = "https://goodreads.com";

class Goodreads {
  private key: string;

  constructor(key: string) {
    if (!key) {
      throw Error("You must provide Goodreads API key.");
    }

    this.key = key;
  }

  async getBookIdByISBN(isbn: string) {
    try {
      const response = await httpClient.get(
        `${API_URL}/book/isbn_to_id/${isbn}`,
        {
          params: {
            key: this.key
          }
        }
      );

      if (response.status >= 400) {
        return null;
      }

      return response.data as string;
    } catch (error) {
      logger.error(error);
      return null;
    }
  }

  async getBookById(bookId: string) {
    const response = await httpClient.get(`${API_URL}/book/show/${bookId}`, {
      params: { key: this.key }
    });

    if (response.status >= 400) {
      return null;
    }

    const jsonResponse = await this.xmlToObj(response.data);
    const goodreadsBook = jsonResponse.book;

    const goodreadsAuthorResponse = jsonResponse.book.authors.author;
    const foundOrCreatedAuthor = await this.findOrCreateAuthor(
      goodreadsAuthorResponse
    );

    const book: IBookDetailed = {
      title: goodreadsBook.title,
      pages: goodreadsBook.num_pages,
      isbn: goodreadsBook.isbn13 || goodreadsBook.isbn,
      coverImage: goodreadsBook.image_url || goodreadsBook.small_image_url,
      datePublished: new Date(
        `${goodreadsBook.publication_year}-${goodreadsBook.publication_month}-${
          goodreadsBook.publication_day
        }`
      ),
      available: false,
      featured: false,
      freeDownload: false,
      price: 0,
      summary: goodreadsBook.description,
      author: foundOrCreatedAuthor,
      category: null
    };

    return book;
  }

  async getBookByISBN(isbn: string) {
    const id = await this.getBookIdByISBN(isbn);
    const book = await this.getBookById(id);
    return book;
  }

  async searchAuthorByName(authorName: string) {
    const response = await httpClient.get(
      `${API_URL}/api/author_url/${encodeURIComponent(authorName)}`,
      {
        params: {
          key: this.key
        }
      }
    );

    const jsonResponse = await this.xmlToObj(response.data);
    const goodreadsAuthor = jsonResponse.author as IGoodreadsAuthorSearchResponse;

    return goodreadsAuthor;
  }

  async getAuthorById(authorId: string) {
    const response = await httpClient.get(
      `${API_URL}/author/show/${authorId}`,
      {
        params: {
          key: this.key
        }
      }
    );

    const jsonResponse = await this.xmlToObj(response.data);
    const goodreadsAuthor = jsonResponse.author as IGoodreadsAuthorResponse;

    if (!goodreadsAuthor) {
      return null;
    }

    const author: IAuthor = {
      name: goodreadsAuthor.name,
      biography: goodreadsAuthor.about,
      bornAt: goodreadsAuthor.born_at
        ? new Date(goodreadsAuthor.born_at)
        : null,
      diedAt: goodreadsAuthor.died_at
        ? new Date(goodreadsAuthor.died_at)
        : null,
      imageUrl: goodreadsAuthor.image_url || goodreadsAuthor.large_image_url
    };

    return author;
  }

  private async xmlToObj(xmlResponse: string) {
    const obj: any = await xmlToJSON(xmlResponse);
    return obj.GoodreadsResponse || {};
  }

  /**
   * Tries to find an author in our database and if they don't exist,
   * creates a new record with the data received from Goodreads.
   *
   * @param goodreadsAuthorResponse - Goodreads authors object
   */
  private async findOrCreateAuthor(goodreadsAuthorResponse: object | any[]) {
    // if there is more than one author, the 'authors' field will be an array
    const goodreadsAuthor = Array.isArray(goodreadsAuthorResponse)
      ? goodreadsAuthorResponse[0]
      : goodreadsAuthorResponse;

    const existingAuthor = await authorService.getByName(
      goodreadsAuthor ? goodreadsAuthor.name : ""
    );
    let automaticallyCreatedAuthor = null;

    if (!existingAuthor && goodreadsAuthor) {
      try {
        const goodreadsAuthorDetailed = await this.getAuthorById(
          goodreadsAuthor.id
        );
        automaticallyCreatedAuthor = await authorService.create(
          goodreadsAuthorDetailed
        );

        return automaticallyCreatedAuthor;
      } catch (error) {
        automaticallyCreatedAuthor = null;
      }
    }
  }
}

export default new Goodreads(process.env.GOODREADS_API_KEY);
