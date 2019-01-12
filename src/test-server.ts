import { Server } from "http";
import * as supertest from "supertest";
import { SuperTest, Test } from "supertest";
import app from "./app";
import database from "./services/database";

export async function startTestServer() {
  return new Promise<[Server, SuperTest<Test>]>(resolve => {
    app.once("DB_INITIALIZED", async () => {
      await database.sync({ force: true });

      const server = app.listen(0);
      const api = supertest(server);

      resolve([server, api]);
    });
  });
}
