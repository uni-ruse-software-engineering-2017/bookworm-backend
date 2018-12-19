require("dotenv-override").config({ override: true });

import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import { errorHandler } from "./middleware/error-handler";
import withSession from "./middleware/with-session";
import RestAPI from "./rest-api";

const app = new Koa();

app.use(errorHandler);

app.use(withSession);

app.use(bodyParser({ enableTypes: ["json"] }));

app.use(RestAPI.routes());

export default app;
