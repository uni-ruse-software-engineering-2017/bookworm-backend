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
      { id: "1", name: "Fiction", seoUrl: "fiction" },
      { id: "2", name: "History", seoUrl: "history" },
      { id: "3", name: "Science", seoUrl: "science" },
      { id: "4", name: "Philosphy", seoUrl: "philosphy" },
      { id: "5", name: "Children", seoUrl: "children" }
    ];

    await Category.bulkCreate(topLevelCategories);

    const fictionSubCategories: ICategory[] = [
      { parentId: "1", name: "Sci-fi", seoUrl: "sci-fi" },
      {
        parentId: "1",
        name: "Historical Fiction",
        seoUrl: "historical-fiction"
      },
      { parentId: "1", name: "Magical realism", seoUrl: "magical-realism" },
      { parentId: "1", name: "Fantasy", seoUrl: "fantasy" }
    ];

    await Category.bulkCreate(fictionSubCategories);

    // TODO: add more categories
  },

  down: (queryInterface, Sequelize) => {
    return Category.truncate({ cascade: true, force: true });
  }
};
