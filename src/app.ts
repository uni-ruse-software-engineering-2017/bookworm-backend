require("dotenv-override").config({ override: true });

import { boomify } from "boom";
import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import sessionMiddleware from "./middleware/session.middleware";
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
    let errorBody = error.output.payload;

    if (error.data) {
      errorBody = Object.assign({}, errorBody, { detail: error.data });
    }

    ctx.body = errorBody;

    return ctx;
  }
});

app.use(sessionMiddleware);

app.use(bodyParser({ enableTypes: ["json"] }));

app.use(RestAPI.routes());

export default app;
