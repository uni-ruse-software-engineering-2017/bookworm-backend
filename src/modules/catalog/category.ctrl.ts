import { notFound } from "boom";
import * as HttpStatus from "http-status-codes";
import * as Router from "koa-router";
import withPagination from "../../middleware/with-pagination";
import withRole from "../../middleware/with-role";
import Category from "../../models/Category";
import { ICategory } from "./catalog.contracts";
import categoryService from "./category.service";

const CategoryController = new Router();

CategoryController.get("/", withPagination, async ctx => {
  const categories = await categoryService.getAll(ctx.state.pagination);

  ctx.body = categories;
  return ctx;
});

CategoryController.get("/:id", async function(ctx) {
  const { id } = ctx.params;
  const category = await categoryService.getById(id);

  if (!category) {
    return ctx.throw(notFound(`Category with ID ${id} was not found.`));
  } else {
    ctx.body = category;
    return ctx;
  }
});

CategoryController.post("/", withRole("admin"), async ctx => {
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

CategoryController.patch("/:id", withRole("admin"), async ctx => {
  const id = ctx.params.id as string;
  const categoryData = ctx.request.body as Partial<ICategory>;

  const updatedCategory = await categoryService.edit(id, categoryData);

  ctx.body = updatedCategory;

  return ctx;
});

CategoryController.delete("/:id", withRole("admin"), async ctx => {
  const id = ctx.params.id as string;
  const category = await categoryService.getById(id);

  if (!category) {
    return ctx.throw(notFound(`Category with ID ${id} was not found.`));
  }

  await categoryService.remove(id);

  ctx.body = category;

  return ctx;
});

export default CategoryController;
