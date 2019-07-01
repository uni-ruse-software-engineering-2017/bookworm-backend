import * as Boom from "boom";
import * as HttpStatus from "http-status-codes";
import * as Router from "koa-router";
import withPagination from "../../middleware/with-pagination";
import withRole from "../../middleware/with-role";
import Author from "../../models/Author";
import { IPaginationQuery, searchByColumn } from "../../services/paginate";
import authorService from "./author.service";
import { IAuthor } from "./catalog.contracts";

const AuthorController = new Router();

AuthorController.get("/", withPagination, async ctx => {
  const authorNameQuery = ctx.query.q || "";
  const sort = {
    sortColumn: "name",
    sortOrder: "ASC"
  };

  const query: IPaginationQuery<Author> = authorNameQuery
    ? {
        ...sort,
        ...ctx.state.pagination,
        where: searchByColumn<Author>("name", authorNameQuery)
      }
    : { ...sort, ...ctx.state.pagination };

  const authors = await authorService.getAll(query);
  ctx.body = authors;
  return ctx;
});

AuthorController.get("/:id", async ctx => {
  const { id } = ctx.params;
  const author = await authorService.getById(id);

  if (!author) {
    return ctx.throw(Boom.notFound(`Author with ID ${id} was not found.`));
  } else {
    ctx.body = author;
    return ctx;
  }
});

AuthorController.post("/", withRole("admin"), async ctx => {
  const body = ctx.request.body as IAuthor;
  const author = Author.build(body);
  const authorData = {
    biography: author.biography,
    bornAt: author.bornAt,
    diedAt: author.diedAt || null,
    imageUrl: author.imageUrl || null,
    name: author.name
  } as IAuthor;

  const createdAuthor = await authorService.create(authorData);

  ctx.body = createdAuthor;
  ctx.status = HttpStatus.CREATED;

  return ctx;
});

AuthorController.patch("/:id", withRole("admin"), async ctx => {
  const id = ctx.params.id as string;
  const authorData = ctx.request.body as Partial<IAuthor>;

  const updatedAuthor = await authorService.edit(id, authorData);

  ctx.body = updatedAuthor;
  return ctx;
});

AuthorController.delete("/:id", withRole("admin"), async ctx => {
  const removed = await authorService.remove(ctx.params.id);

  if (!removed) {
    return ctx.throw(
      Boom.notFound(`Author with ID ${ctx.params.id} was not found.`)
    );
  }

  ctx.body = removed;
  return ctx;
});

export default AuthorController;
