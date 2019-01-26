import { notFound } from "boom";
import * as HttpStatus from "http-status-codes";
import * as Router from "koa-router";
import withAuthentication from "../../middleware/with-authentication";
import withPagination from "../../middleware/with-pagination";
import withRole from "../../middleware/with-role";
import { IApplicationUserData, IUserProfile } from "./user.contracts";
import userService from "./user.service";

const UserController = new Router();

UserController.use(withAuthentication);

UserController.get("/", withRole("admin"), withPagination, async ctx => {
  const users = await userService.getAll(ctx.state.pagination);
  ctx.body = users;
  return ctx;
});

UserController.get("/profile", async ctx => {
  const profile = ctx.state.session as IUserProfile;

  // exclude confidential data
  ctx.body = {
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    role: profile.role
  } as Partial<IUserProfile>;

  return ctx;
});

UserController.get("/:username", withRole("admin"), async ctx => {
  const user = await userService.getByUsername(ctx.params.username);

  if (!user) {
    throw notFound("User not found.");
  }

  ctx.body = user;
  return ctx;
});

UserController.post("/", withRole("admin"), async ctx => {
  const userData = ctx.request.body as IApplicationUserData;
  const user = await userService.create(userData);

  ctx.body = user;
  ctx.status = HttpStatus.CREATED;

  return ctx;
});

export default UserController;
