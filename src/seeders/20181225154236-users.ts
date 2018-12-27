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
  up: (queryInterface, Sequelize) => {
    const pass = hashSync("12332112", 10);

    return ApplicationUser.bulkCreate([
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
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return ApplicationUser.truncate({ cascade: true, force: true });
  }
};
