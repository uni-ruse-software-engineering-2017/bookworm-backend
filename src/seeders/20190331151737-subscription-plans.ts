import SubscriptionPlan from "../models/SubscriptionPlan";
import { ISubscriptionPlan } from "../modules/commerce/commerce.contracts";
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
    const subscriptionPlans: ISubscriptionPlan[] = [
      {
        name: "Casual Reader",
        booksPerMonth: 5,
        pricePerMonth: 7.99
      },
      {
        name: "Avid Reader",
        booksPerMonth: 8,
        pricePerMonth: 9.99
      },
      {
        name: "Book Lover",
        booksPerMonth: 12,
        pricePerMonth: 12.99
      },
      {
        name: "Scholar",
        booksPerMonth: 15,
        pricePerMonth: 14.99
      },
      {
        name: "Bookworm",
        booksPerMonth: 20,
        pricePerMonth: 17.99
      }
    ];

    try {
      await SubscriptionPlan.bulkCreate(subscriptionPlans);
    } catch (error) {
      console.error(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await SubscriptionPlan.truncate({ cascade: true, force: true });
    } catch (error) {
      console.error(error);
    }
  }
};
