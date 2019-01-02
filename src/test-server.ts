import { Server } from "http";
import app from "./app";
import database from "./services/database";

import supertest = require("supertest");

interface ITestServer {
  server: Server;
  request: supertest.SuperTest<supertest.Test>;
}

export default async function startTestServer() {
  return new Promise<ITestServer>(resolve => {
    app.once("DB_INITIALIZED", async () => {
      await database.sync({ force: true });

      const server = app.listen(0);
      const request = supertest(server);

      const result: ITestServer = {
        request: request,
        server: server
      };

      resolve(result);
    });
  });
}
