require("dotenv-override").config({ override: true });

import database from "../services/database";

database
  .authenticate()
  .then(async () => {
    try {
      await database.dropAllSchemas({ logging: true });
      await database.sync({ force: true });
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .catch(error => console.error);
