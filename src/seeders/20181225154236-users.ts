import { hashSync } from "bcrypt";
import ApplicationUser from "../models/ApplicationUser";
import database from "../services/database";
import logger from "../services/logger";

"use strict";

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
    const pass = hashSync("12332112", 10);

    const users = [
      {
        active: true,
        email: "tsvetan.ganev@hotmail.com",
        firstName: "Tsvetan",
        lastName: "Ganev",
        password: pass,
        role: "customer"
      },
      {
        active: true,
        email: "admin@bookworm.com",
        firstName: "Jane",
        lastName: "Doe",
        password: pass,
        role: "admin"
      }
    ];

    try {
      await ApplicationUser.bulkCreate(users);
    } catch (error) {
      console.error(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await ApplicationUser.truncate({ cascade: true, force: true });
    } catch (error) {
      console.error(error);
    }
  }
};
