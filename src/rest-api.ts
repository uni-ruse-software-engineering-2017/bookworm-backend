import * as Router from "koa-router";
import CatalogController from "./modules/catalog/catalog.ctrl";

const RestAPI = new Router();

RestAPI.use("/api/catalog", CatalogController.routes());

export default RestAPI;
