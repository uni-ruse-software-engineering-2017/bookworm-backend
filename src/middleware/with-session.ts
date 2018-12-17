import { verify } from "jsonwebtoken";
import { Middleware } from "koa";
import { IJwtData } from "../modules/auth/auth.contracts";
import { sessionService } from "../services/session";
import { base64Encode } from "../util/base64";

const withSession: Middleware = async (ctx, next) => {
  const authHeader = (ctx.request.headers["authorization"] as string) || "";
  ctx.state.session = undefined;

  if (!authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decodedJwt = await (<IJwtData>(
      verify(token, base64Encode(process.env.JWT_SECRET))
    ));

    ctx.state.session = await sessionService.getById(decodedJwt.sessionId);
    return next();
  } catch (error) {
    return next();
  }
};

export default withSession;
