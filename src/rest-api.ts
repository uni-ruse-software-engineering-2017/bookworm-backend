import * as Router from "koa-router";
import AuthController from "./modules/auth/auth.ctrl";
import CatalogController from "./modules/catalog/catalog.ctrl";
import UserController from "./modules/user/user.ctrl";

const RestAPI = new Router();

RestAPI.use("/api", AuthController.routes());
RestAPI.use("/api/catalog", CatalogController.routes());
RestAPI.use("/api/user", UserController.routes());

export default RestAPI;
