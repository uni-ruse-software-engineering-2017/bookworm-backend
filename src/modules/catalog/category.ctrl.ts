import { notFound } from "boom";
import * as HttpStatus from "http-status-codes";
import * as Router from "koa-router";
import paginationMiddleware from "../../middleware/pagination.middleware";
import Category from "../../models/Category";
import categoryService, { ICategory } from "./category.service";

const CategoryController = new Router();

CategoryController.get("/", paginationMiddleware, async ctx => {
  const categories = await categoryService.getAll(ctx.state.pagination);

  ctx.body = categories;
  return ctx;
});

CategoryController.get("/:id", async ctx => {
  const { id } = ctx.params;
  const category = await categoryService.getById(id);

  if (!category) {
    return ctx.throw(notFound(`Category with ID ${id} was not found.`));
  } else {
    ctx.body = category;
    return ctx;
  }
});

CategoryController.post("/", async ctx => {
  const body = ctx.request.body as ICategory;
  const category = Category.build(body);
  const categoryData = {
    name: category.name,
    parentId: category.parentId || null,
    seoUrl: category.seoUrl
  } as ICategory;

  const createdCategory = await categoryService.create(categoryData);

  ctx.body = createdCategory;
  ctx.status = HttpStatus.CREATED;

  return ctx;
});

CategoryController.patch("/:id", async ctx => {
  const id = ctx.params.id as string;
  const categoryData = ctx.request.body as Partial<ICategory>;

  const updatedCategory = await categoryService.edit(id, categoryData);

  ctx.body = updatedCategory;

  return ctx;
});

export default CategoryController;
