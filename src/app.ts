require("dotenv-override").config({ override: true });

import * as cors from "@koa/cors";
import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import { errorHandler } from "./middleware/error-handler";
import withSession from "./middleware/with-session";
import RestAPI from "./rest-api";
import database from "./services/database";
import logger from "./services/logger";

const app = new Koa();

app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGINS || "*",
    methods: "GET,HEAD,PUT,POST,DELETE,PATCH"
  })
);

app.use(errorHandler);

app.use(withSession);

app.use(bodyParser({ enableTypes: ["json"] }));

app.use(RestAPI.routes());

(async () => {
  try {
    await database.authenticate();
    // await database.drop({ cascade: true });
    // await database.sync({ force: false });

    logger.info("Application connected to the database successfully.");
    app.emit("DB_INITIALIZED");
  } catch (error) {
    logger.error(error);
  }
})();

export default app;
