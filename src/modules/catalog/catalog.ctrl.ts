import * as Router from "koa-router";
import AuthorController from "./author.ctrl";
import BookController from "./book.ctrl";
import CategoryController from "./category.ctrl";
import GoodreadsController from "./goodreads.ctrl";

const CatalogController = new Router();

CatalogController.use("/books", BookController.routes());
CatalogController.use("/authors", AuthorController.routes());
CatalogController.use("/categories", CategoryController.routes());
CatalogController.use("/goodreads", GoodreadsController.routes());

export default CatalogController;
