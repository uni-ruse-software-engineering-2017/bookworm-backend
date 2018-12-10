import * as Router from "koa-router";
import AuthorController from "./author.ctrl";
import BookController from "./book.ctrl";
import CategoryController from "./category.ctrl";

const CatalogController = new Router();

CatalogController.use("/books", BookController.routes());
CatalogController.use("/authors", AuthorController.routes());
CatalogController.use("/categories", CategoryController.routes());

export default CatalogController;
