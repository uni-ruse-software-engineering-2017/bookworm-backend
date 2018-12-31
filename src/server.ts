import app from "./app";
import logger from "./services/logger";

const PORT = process.env.PORT || 3000;

app.on("DB_INITIALIZED", () => {
  app.listen(PORT, () => {
    logger.info(`Sever listening on port ${PORT}.`);
  });
});
