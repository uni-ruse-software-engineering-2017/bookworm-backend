import { forbidden, unauthorized } from "boom";
import { Context } from "koa";
import { UserRole } from "../models/ApplicationUser";

const withRole = (role: UserRole) => async (ctx: Context, next: Function) => {
  const { session } = ctx.state;

  if (Object.keys(session || {}).length === 0) {
    throw unauthorized();
  }

  if (session.role !== role) {
    throw forbidden();
  }

  return next();
};

export default withRole;
