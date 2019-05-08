import { badRequest, boomify } from "boom";
import { Middleware } from "koa";
import logger from "../services/logger";

export const errorHandler: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.error(err);
    }
    // catch invalid JSON body requests
    if (err instanceof SyntaxError) {
      const badRequestError = badRequest();
      ctx.body = badRequestError.output.payload;
      ctx.status = badRequestError.output.statusCode;
      return ctx;
    }

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
