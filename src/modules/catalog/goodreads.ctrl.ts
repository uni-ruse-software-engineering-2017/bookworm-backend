import { notFound } from "boom";
import * as HttpStatus from "http-status-codes";
import * as Router from "koa-router";
import withRole from "../../middleware/with-role";
import goodreads from "./goodreads.service";

const GoodreadsController = new Router();

GoodreadsController.get("/books/:isbn", withRole("admin"), async ctx => {
  const book = await goodreads.getBookByISBN(ctx.params.isbn);

  if (!book) {
    throw notFound(
      `Book with ISBN "${ctx.params.isbn}" was not found on Goodreads.`
    );
  }

  ctx.body = book;
  ctx.status = HttpStatus.OK;
});

GoodreadsController.get("/authors/:authorId", withRole("admin"), async ctx => {
  const author = await goodreads.getAuthorById(ctx.params.authorId);

  if (!author) {
    throw notFound(
      `Author with ID "${ctx.params.authorId}" was not found on Goodreads.`
    );
  }

  ctx.body = author;
  ctx.status = HttpStatus.OK;
});

GoodreadsController.get(
  "/search/authors/:authorName",
  withRole("admin"),
  async ctx => {
    const author = await goodreads.searchAuthorByName(ctx.params.authorName);

    if (!author) {
      throw notFound(`Author matching this query was not found on Goodreads.`);
    }

    ctx.body = author;
    ctx.status = HttpStatus.OK;
  }
);

export default GoodreadsController;
