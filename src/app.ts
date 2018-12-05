require("dotenv-override").config({ override: true });

import { boomify } from "boom";
import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import RestAPI from "./rest-api";
import logger from "./services/logger";

const app = new Koa();

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    logger.error(err);
    const error = boomify(err);
    const statusCode = error.output.statusCode || 500;

    ctx.status = statusCode;
    ctx.body = error.output.payload;

    return ctx;
  }
});

app.use(bodyParser({ enableTypes: ["json"] }));

app.use(RestAPI.routes());

export default app;
