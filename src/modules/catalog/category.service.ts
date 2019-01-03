import { badData, notFound } from "boom";
import slugify from "slugify";
import Category from "../../models/Category";
import paginate from "../../services/paginate";
import { ICategory } from "./catalog.contracts";

class CategoryService {
  async getAll({ page = 1, pageSize = 25 } = {}) {
    return paginate(Category, { page, pageSize, scope: "full" });
  }

  async create(categoryData: ICategory) {
    try {
      if (!categoryData.seoUrl) {
        categoryData.seoUrl = slugify(categoryData.name || "");
      }

      const category = await Category.create(categoryData);
      return category;
    } catch (error) {
      throw badData("Validation failed.", error.errors || error);
    }
  }

  async getById(id: string): Promise<ICategory | null> {
    const category = await Category.scope("full").findByPrimary(id);

    if (!category) {
      return null;
    }

    // attach the category's children
    const categoryObj = category.toJSON() as ICategory;
    categoryObj.children = (await Category.children(id)) || [];

    return categoryObj;
  }

  async edit(id: string, data: Partial<ICategory> = {}) {
    const category = await Category.findByPrimary(id);

    if (!category) {
      throw notFound("Category not found.");
    }

    // nothing to update
    if ((Object.keys(data).length = 0)) {
      return category;
    }

    if (data.name) {
      category.name = data.name;
    }

    if (data.seoUrl) {
      category.seoUrl = data.seoUrl;
    }

    if (data.parentId || data.parentId == null) {
      category.parentId = data.parentId;
    }

    try {
      await category.save();
      return this.getById(id);
    } catch (error) {
      throw badData(error, error.errors);
    }
  }

  async remove(id: string): Promise<Category | null> {
    const category = await Category.findByPrimary(id);
    if (category) {
      await category.destroy();
      return category;
    }

    return null;
  }
}

export default new CategoryService();
