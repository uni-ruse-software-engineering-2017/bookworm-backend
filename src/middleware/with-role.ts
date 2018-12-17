import { forbidden } from "boom";
import { Context } from "koa";
import { UserRole } from "../models/ApplicationUser";

const withRole = (role: UserRole) => async (ctx: Context, next: Function) => {
  const { session = {} } = ctx.state;

  if (session.role !== role) {
    throw forbidden();
  }

  return next();
};

export default withRole;
