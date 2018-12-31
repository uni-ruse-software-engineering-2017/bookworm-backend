import { UNAUTHORIZED } from "http-status-codes";
import * as supertest from "supertest";
import app from "../../../app";
import database, { resetDatabase } from "../../../services/database";

const API_URL = "/api";
let request: supertest.SuperTest<supertest.Test> = null;

beforeAll(async done => {
  app.once("DB_INITIALIZED", async () => {
    await database.sync({ force: true });

    const server = app.listen("3001");
    request = supertest(server);

    done();
  });
});

beforeEach(async () => {
  await resetDatabase();
});

describe("User module", () => {
  describe("POST /user", () => {
    it("should not allow unauthenticated users to create new users", async () => {
      const response = await request.post(`${API_URL}/user`);

      expect(response.status).toEqual(UNAUTHORIZED);
    });
  });
});
