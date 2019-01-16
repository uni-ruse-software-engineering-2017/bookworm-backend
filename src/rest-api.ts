import * as Router from "koa-router";
import AuthController from "./modules/auth/auth.ctrl";
import CatalogController from "./modules/catalog/catalog.ctrl";
import CartController from "./modules/commerce/cart.ctrl";
import SubscriptionPlanController from "./modules/commerce/subscription-plan.ctrl";
import UserController from "./modules/user/user.ctrl";

const RestAPI = new Router();

RestAPI.use("/api", AuthController.routes());
RestAPI.use("/api/catalog", CatalogController.routes());
RestAPI.use("/api/user", UserController.routes());
RestAPI.use("/api/cart", CartController.routes());
RestAPI.use("/api/subscription-plans", SubscriptionPlanController.routes());

export default RestAPI;
