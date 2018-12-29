import httpClient from "../../services/http-client";
import logger from "../../services/logger";
import { xmlToJSON } from "../../services/xml-parser";
import {
  IBook,
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

    const book: IBook = {
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
      summary: goodreadsBook.description
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
    return jsonResponse.author as IGoodreadsAuthorSearchResponse;
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
    return jsonResponse.author as IGoodreadsAuthorResponse;
  }

  private async xmlToObj(xmlResponse: string) {
    const obj: any = await xmlToJSON(xmlResponse);
    return obj.GoodreadsResponse || {};
  }
}

export default new Goodreads(process.env.GOODREADS_API_KEY);
