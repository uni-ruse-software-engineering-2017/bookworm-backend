import { verify } from "jsonwebtoken";
import { Middleware } from "koa";
import { IJwtData } from "../modules/auth/auth.contracts";
import { sessionService } from "../services/session";
import { base64Encode } from "../util/base64";

const withSession: Middleware = async (ctx, next) => {
  ctx.state.session = undefined;

  const authHeader = (ctx.request.headers["authorization"] as string) || "";
  const sid = ctx.cookies.get("sid");
  let authToken = "";

  if (authHeader.startsWith("Bearer ")) {
    // extract the token from the authorization header
    authToken = authHeader.replace("Bearer ", "");
  } else if (sid) {
    // extract the token from the session cookie
    authToken = sid;
  } else {
    // there is no session for this request
    return next();
  }

  try {
    const decodedJwt = await (<IJwtData>(
      verify(authToken, base64Encode(process.env.JWT_SECRET))
    ));

    ctx.state.session = await sessionService.getById(decodedJwt.sessionId);
    return next();
  } catch (error) {
    return next();
  }
};

export default withSession;
