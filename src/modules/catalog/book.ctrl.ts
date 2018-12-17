import * as HttpStatus from "http-status-codes";
import * as Router from "koa-router";
import withRole from "../../middleware/with-role";

const BookController = new Router();

BookController.get("/", async ctx => {
  ctx.body = [];
  return ctx;
});

BookController.get("/:id", async ctx => {
  ctx.body = {};
  return ctx;
});

BookController.post("/", withRole("admin"), async ctx => {
  ctx.body = {};
  ctx.status = HttpStatus.CREATED;
  return ctx;
});

BookController.patch("/:id", withRole("admin"), async ctx => {
  ctx.body = {};
  return ctx;
});

BookController.delete("/:id", withRole("admin"), async ctx => {
  ctx.body = {};
  ctx.status = HttpStatus.NO_CONTENT;
  return ctx;
});

export default BookController;
