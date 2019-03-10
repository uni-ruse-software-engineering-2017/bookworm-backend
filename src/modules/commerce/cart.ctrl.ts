import * as HttpStatus from "http-status-codes";
import * as Router from "koa-router";
import withRole from "../../middleware/with-role";
import { IApplicationUserData } from "../user/user.contracts";
import cartService from "./cart.service";

const CartController = new Router();

CartController.get("/", withRole("customer"), async ctx => {
  const session = ctx.state.session as IApplicationUserData;

  ctx.body = await cartService.getItems(session.id);

  return ctx;
});

CartController.post("/", withRole("customer"), async ctx => {
  const session = ctx.state.session as IApplicationUserData;
  const { bookId } = ctx.request.body;

  const added = await cartService.addItem(session.id, bookId);

  ctx.body = added;
  ctx.status = HttpStatus.CREATED;

  return ctx;
});

CartController.delete("/", withRole("customer"), async ctx => {
  const session = ctx.state.session as IApplicationUserData;

  await cartService.clear(session.id);

  ctx.status = HttpStatus.NO_CONTENT;

  return ctx;
});

CartController.delete("/:id", withRole("customer"), async ctx => {
  const session = ctx.state.session as IApplicationUserData;
  const cartLineId = ctx.params.id as string;

  await cartService.removeItem(session.id, cartLineId);

  ctx.status = HttpStatus.NO_CONTENT;

  return ctx;
});

CartController.post("/checkout", withRole("customer"), async ctx => {
  const session = ctx.state.session as IApplicationUserData;

  // TODO: implement payments before checkout
  const purchase = await cartService.checkout(session.id);

  ctx.body = purchase;
  ctx.status = HttpStatus.OK;

  return ctx;
});

export default CartController;
