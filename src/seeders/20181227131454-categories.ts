import Category from "../models/Category";
import { ICategory } from "../modules/catalog/catalog.contracts";
import database from "../services/database";
import logger from "../services/logger";

(async () => {
  try {
    await database.authenticate();
    await database.sync({ force: false });
  } catch (error) {
    logger.error(error);
  }
})();

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const topLevelCategories: ICategory[] = [
      { name: "Fiction", seoUrl: "fiction" },
      { name: "History", seoUrl: "history" },
      { name: "Science", seoUrl: "science" },
      { name: "Philosphy", seoUrl: "philosphy" },
      { name: "Children", seoUrl: "children" }
    ];

    const created = await Category.bulkCreate(topLevelCategories);

    const fictionSubCategories: ICategory[] = [
      { parentId: created[0].id, name: "Sci-fi", seoUrl: "sci-fi" },
      {
        parentId: created[0].id,
        name: "Historical Fiction",
        seoUrl: "historical-fiction"
      },
      {
        parentId: created[0].id,
        name: "Magical realism",
        seoUrl: "magical-realism"
      },
      { parentId: created[0].id, name: "Fantasy", seoUrl: "fantasy" }
    ];

    try {
      await Category.bulkCreate(fictionSubCategories);
    } catch (error) {
      console.error(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await Category.truncate({ cascade: true, force: true });
    } catch (error) {
      console.error(error);
    }
  }
};
