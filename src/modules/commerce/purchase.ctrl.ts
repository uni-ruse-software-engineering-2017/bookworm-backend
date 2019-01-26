import * as Router from "koa-router";
import withAuthentication from "../../middleware/with-authentication";
import withPagination from "../../middleware/with-pagination";
import Purchase from "../../models/Purchase";
import { IPaginationQuery } from "../../services/paginate";
import { IApplicationUserData } from "../user/user.contracts";
import purchaseService from "./purchase.service";

const PurchaseController = new Router();

PurchaseController.use(withAuthentication);

PurchaseController.get("/", withPagination, async ctx => {
  const session = ctx.state.session as IApplicationUserData;
  const query: IPaginationQuery<Purchase> = ctx.state.pagination;

  if (session.role === "admin") {
    ctx.body = await purchaseService.getAll(query);
  } else {
    ctx.body = await purchaseService.getAllForUser(session.id, query);
  }

  return ctx;
});

PurchaseController.get("/:purchaseId", async ctx => {
  const session = ctx.state.session as IApplicationUserData;

  // admins can access all purchases, while customers can only access their own
  ctx.body = await purchaseService.getById({
    userId: session.role === "customer" ? session.id : undefined,
    purchaseId: ctx.params.purchaseId
  });

  return ctx;
});

export default PurchaseController;
