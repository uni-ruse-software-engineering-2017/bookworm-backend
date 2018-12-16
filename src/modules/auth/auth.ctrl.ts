import * as HttpStatus from "http-status-codes";
import { sign } from "jsonwebtoken";
import * as Router from "koa-router";
import { base64Encode } from "../../util/base64";
import { ILoginCredentials, ISignUpData } from "./auth.contracts";
import authService from "./auth.service";

const AuthController = new Router();

AuthController.post("/login", async ctx => {
  const { email, password } = ctx.request.body as ILoginCredentials;

  const userSession = await authService.login({ email, password });

  const jwt = await sign(
    {
      sessionId: userSession.sessionId
    },
    base64Encode(process.env.JWT_SECRET),
    {
      issuer: process.env.JWT_ISSUER,
      expiresIn: process.env.SESSION_DURATION || "1d"
    }
  );

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
