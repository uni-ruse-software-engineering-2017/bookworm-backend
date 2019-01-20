import * as Router from "koa-router";
import withRole from "../../middleware/with-role";
import { IApplicationUserData } from "../user/user.contracts";
import purchaseService from "./purchase.service";

const PurchaseController = new Router();

PurchaseController.get("/", withRole("customer"), async ctx => {
  const session = ctx.state.session as IApplicationUserData;

  ctx.body = await purchaseService.getAll(session.id);

  return ctx;
});

PurchaseController.get("/:purchaseId", withRole("customer"), async ctx => {
  const session = ctx.state.session as IApplicationUserData;

  ctx.body = await purchaseService.getById({
    userId: session.id,
    purchaseId: ctx.params.purchaseId
  });

  return ctx;
});

export default PurchaseController;
