import * as Router from "koa-router";
import AuthorController from "./author.ctrl";
import BookController from "./book.ctrl";

const CatalogController = new Router();

CatalogController.use("/books", BookController.routes());
CatalogController.use("/authors", AuthorController.routes());

export default CatalogController;
