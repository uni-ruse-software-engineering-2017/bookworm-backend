import * as HttpStatus from "http-status-codes";
import * as Router from "koa-router";
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

export default AuthController;
