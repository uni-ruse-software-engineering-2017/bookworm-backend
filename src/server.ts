import app from "./app";
import database from "./services/database";
import logger from "./services/logger";

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await database.authenticate();
    await database.drop({ cascade: true });
    await database.sync({ force: true });
    app.listen(PORT, () => {
      logger.info(`Sever listening on port ${PORT}.`);
    });
  } catch (error) {
    logger.error(error);
  }
})();
