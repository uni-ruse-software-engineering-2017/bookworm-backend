import { unauthorized } from "boom";
import { Middleware } from "koa";

const withAuthentication: Middleware = async (ctx, next) => {
  const { session } = ctx.state;

  if (!session) {
    throw unauthorized();
  }

  return next();
};

export default withAuthentication;
