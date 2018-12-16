import * as HttpStatus from "http-status-codes";
import * as Router from "koa-router";
import withPagination from "../../middleware/pagination.middleware";
import userService, { IApplicationUserData } from "./user.service";

const UserController = new Router();

UserController.get("/", withPagination, async ctx => {
  const users = await userService.getAll(ctx.state.pagination);
  ctx.body = users;
  return ctx;
});

UserController.post("/", async ctx => {
  const userData = ctx.request.body as IApplicationUserData;
  const user = await userService.create(userData);

  ctx.body = user;
  ctx.status = HttpStatus.CREATED;

  return ctx;
});

export default UserController;
