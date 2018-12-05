import * as Boom from "boom";
import * as HttpStatus from "http-status-codes";
import * as Router from "koa-router";
import paginationMiddleware from "../../middleware/pagination.middleware";
import Author from "../../models/Author";
import authorService, { IAuthor } from "./author.service";

const AuthorController = new Router();

AuthorController.get("/", paginationMiddleware, async ctx => {
  const authors = await authorService.getAll(ctx.state.pagination);
  ctx.body = authors || [];
  return ctx;
});

AuthorController.get("/:id", async ctx => {
  const { id } = ctx.params;
  const author = await authorService.getById(id);

  if (!author) {
    return ctx.throw(404, Boom.notFound(`Author with ID ${id} was not found.`));
    // throw Boom.notFound(`Author with ID ${id} was not found.`);
  } else {
    ctx.body = author;
    return ctx;
  }
});

AuthorController.post("/", async ctx => {
  const body = ctx.request.body as IAuthor;
  const author = Author.build(body);
  const authorData = {
    biography: author.biography,
    birthDate: author.birthDate,
    name: author.name
  } as IAuthor;

  const createdAuthor = await authorService.create(authorData);

  ctx.body = createdAuthor;
  ctx.status = HttpStatus.CREATED;

  return ctx;
});

AuthorController.patch("/:id", async ctx => {
  ctx.body = {};
  return ctx;
});

AuthorController.delete("/:id", async ctx => {
  ctx.body = {};
  ctx.status = HttpStatus.NO_CONTENT;
  return ctx;
});

export default AuthorController;
