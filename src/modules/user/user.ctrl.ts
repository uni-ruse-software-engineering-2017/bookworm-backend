import { notFound } from "boom";
import * as HttpStatus from "http-status-codes";
import * as Router from "koa-router";
import withAuthentication from "../../middleware/with-authentication";
import withPagination from "../../middleware/with-pagination";
import withRole from "../../middleware/with-role";
import md5 from "../../util/md5";
import subscriptionService from "../commerce/subscription.service";
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
  const user = await userService.getById(profile.id);

  const purchasedBooks = await user.purchasedBooks();
  const creditsUsed = await subscriptionService.getCreditsSpentThisMonth(user);
  const booksAvailableForOnlineReading: string[] = [
    ...(await user.booksStartedReading())
  ];

  ctx.body = {
    id: profile.id,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    role: profile.role,
    ownedBooks: [...purchasedBooks],
    booksAvailableForOnlineReading: booksAvailableForOnlineReading,
    subscription: user.subscription
      ? {
          ...user.subscription.toJSON(),
          isActive: user.subscription.isActive,
          credits: {
            used: creditsUsed,
            limit: user.subscription.booksPerMonth
          }
        }
      : null,
    gravatarUrl: `https://www.gravatar.com/avatar/${md5(
      profile.email
    )}?d=mp&s=200`
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
