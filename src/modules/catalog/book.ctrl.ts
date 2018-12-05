import * as HttpStatus from "http-status-codes";
import * as Router from "koa-router";

const BookController = new Router();

BookController.get("/", async ctx => {
  ctx.body = [];
  return ctx;
});

BookController.get("/:id", async ctx => {
  ctx.body = {};
  return ctx;
});

BookController.post("/", async ctx => {
  ctx.body = {};
  ctx.status = HttpStatus.CREATED;
  return ctx;
});

BookController.patch("/:id", async ctx => {
  ctx.body = {};
  return ctx;
});

BookController.delete("/:id", async ctx => {
  ctx.body = {};
  ctx.status = HttpStatus.NO_CONTENT;
  return ctx;
});

export default BookController;
