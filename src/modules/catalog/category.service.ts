import { badData, notFound } from "boom";
import slugify from "slugify";
import Category from "../../models/Category";
import paginate from "../../services/paginate";
import { ICategory, ITree, ITreeNode } from "./catalog.contracts";

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

      // prevent endless loops in the hierarchy
      if (category.parentId === category.id) {
        category.parentId = null;
        return await category.save();
      }

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

    if (category.id === data.parentId) {
      throw badData(`Category's parent cannot be the category itself.`);
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

  /**
   * Returns all categories as a tree structure.
   */
  async getTreeView(): Promise<ITree<ICategory>> {
    const rootCategories = await this.getRootCategories();

    // start from each top-level category
    // and build the tree structure downwards
    const childrenSubTrees = await Promise.all(
      rootCategories.map(rootCategory => this.buildCategoryTree(rootCategory))
    );

    // match the built sub-trees with the top-level categories
    const tree: ITree<ICategory> = rootCategories.map(rc => {
      const node: ITreeNode<ICategory> = {
        value: rc,
        children: childrenSubTrees.find(child => child.value.id === rc.id)
          .children
      };
      return node;
    });

    return tree;
  }

  /**
   * Lists all top-level categories (which don't have a parent).
   */
  async getRootCategories() {
    return Category.findAll({
      where: {
        parentId: null
      }
    });
  }

  /**
   * Recursive function which builds up the category tree
   * from a starting category downwards.
   *
   * @param category - current category
   */
  private async buildCategoryTree(
    category: ICategory
  ): Promise<ITreeNode<ICategory>> {
    const childrenCategories = await Category.findAll({
      where: {
        parentId: category.id
      }
    });

    const children: ITreeNode<ICategory>[] = await Promise.all(
      childrenCategories.map(childCategory =>
        // call recursivelly
        this.buildCategoryTree(childCategory)
      )
    );

    const node: ITreeNode<ICategory> = {
      value: category,
      children: children
    };

    return node;
  }
}

export default new CategoryService();
