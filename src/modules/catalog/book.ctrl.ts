import * as HttpStatus from "http-status-codes";
import * as Router from "koa-router";
import withRole from "../../middleware/with-role";
import bookService from "./book.service";
import { IBook } from "./catalog.contracts";

const BookController = new Router();

BookController.get("/", async ctx => {
  ctx.body = [];
  return ctx;
});

BookController.get("/:id", async ctx => {
  const book = await bookService.getById(ctx.params.id);

  ctx.body = book;
  return ctx;
});

BookController.post("/", withRole("admin"), async ctx => {
  const bookData = ctx.request.body as IBook;
  const bookCreated = await bookService.create(bookData);

  ctx.body = bookCreated;
  ctx.status = HttpStatus.CREATED;
  return ctx;
});

BookController.patch("/:id", withRole("admin"), async ctx => {
  const bookData = ctx.request.body as Partial<IBook>;
  const updatedBook = await bookService.edit(ctx.params.id, bookData);

  ctx.body = updatedBook;
  return ctx;
});

BookController.delete("/:id", withRole("admin"), async ctx => {
  const removedBook = await bookService.remove(ctx.params.id);

  ctx.status = HttpStatus.OK;
  ctx.body = removedBook;
  return ctx;
});

export default BookController;
