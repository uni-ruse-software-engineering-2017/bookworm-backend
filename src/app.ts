require("dotenv-override").config({ override: true });

import * as cors from "@koa/cors";
import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import * as mount from "koa-mount";
import * as serveStatic from "koa-static";
import { join } from "path";
import { errorHandler } from "./middleware/error-handler";
import withSession from "./middleware/with-session";
import RestAPI from "./rest-api";
import database from "./services/database";
import logger from "./services/logger";
import webhooks from "./webhooks";

const STATIC_FILES_PATH = join(__dirname, "/uploads");

const app = new Koa();

app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGINS || "*",
    methods: "GET,HEAD,PUT,POST,DELETE,PATCH",
    credentials: true
  })
);

app.use(errorHandler);

app.use(withSession);

app.use(bodyParser({ enableTypes: ["json"] }));

app.use(mount("/files", serveStatic(STATIC_FILES_PATH)));

app.use(RestAPI.routes());

app.use(webhooks.routes());

(async () => {
  try {
    await database.authenticate();
    // await database.drop({ cascade: true });
    await database.sync({ force: false });

    logger.info("Application connected to the database successfully.");
    app.emit("DB_INITIALIZED");
  } catch (error) {
    logger.error(error);
  }
})();

export default app;
