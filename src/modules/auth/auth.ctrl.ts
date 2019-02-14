import * as HttpStatus from "http-status-codes";
import * as Router from "koa-router";
import withAuthentication from "../../middleware/with-authentication";
import { IUserSession, SESSION_DURATION_IN_SECS } from "../../services/session";
import { createJwt } from "../../util/jwt";
import { ILoginCredentials, ISignUpData } from "./auth.contracts";
import authService from "./auth.service";

const AuthController = new Router();

AuthController.post("/login", async ctx => {
  const { email, password } = ctx.request.body as ILoginCredentials;

  const userSession = await authService.login({ email, password });

  const jwt = await createJwt(userSession.sessionId);

  ctx.body = {
    token: jwt
  };

  // the session should expire in N days counting from today
  const sessionExpiresAt = new Date(
    Date.now() + SESSION_DURATION_IN_SECS * 1000
  );

  // set the authorization cookie
  ctx.cookies.set("sid", jwt, {
    httpOnly: true,
    expires: sessionExpiresAt
  });
  ctx.response.headers["Access-Control-Allow-Credentials"] = "true";

  return ctx;
});

AuthController.post("/sign-up", async ctx => {
  const signUpData = ctx.request.body as ISignUpData;

  await authService.signUp(signUpData);

  ctx.body = {
    success: true
  };

  ctx.status = HttpStatus.CREATED;

  return ctx;
});

AuthController.post("/logout", withAuthentication, async ctx => {
  const session = ctx.state.session as IUserSession;

  // delete the session
  await authService.logout(session.sessionId);

  ctx.body = {
    success: true
  };

  // unset the authorization cookie
  ctx.cookies.set("sid", undefined, {
    httpOnly: true
  });
  ctx.response.headers["Access-Control-Allow-Credentials"] = "true";

  return ctx;
});

export default AuthController;
