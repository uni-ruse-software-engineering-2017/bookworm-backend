import { boomify } from "boom";
import { Middleware } from "koa";
import logger from "../services/logger";

export const errorHandler: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const error = boomify(err);
    const statusCode = error.output.statusCode || 500;

    ctx.status = statusCode;
    let errorBody = error.output.payload;

    logger.error(error);

    if (error.data) {
      errorBody = Object.assign({}, errorBody, { detail: error.data });
    }

    ctx.body = errorBody;

    return ctx;
  }
};
