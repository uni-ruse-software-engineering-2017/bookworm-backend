import { Server } from "http";
import {
  CREATED,
  FORBIDDEN,
  UNAUTHORIZED,
  UNPROCESSABLE_ENTITY
} from "http-status-codes";
import * as supertest from "supertest";
import app from "../../../app";
import database, { resetDatabase } from "../../../services/database";
import { ILoginCredentials } from "../../auth/auth.contracts";
import { IApplicationUserData } from "../user.contracts";
import userService from "../user.service";

const API_URL = "/api";

let request: supertest.SuperTest<supertest.Test> = null;
let server: Server = null;
let adminJwt = "";

async function generateAdminToken() {
  const adminUser: IApplicationUserData = {
    email: "admin@example.com",
    password: "12332112",
    active: true,
    firstName: "John",
    lastName: "Doe",
    role: "admin"
  };

  await userService.create(adminUser);

  const response = await request.post(`${API_URL}/login`).send({
    email: adminUser.email,
    password: adminUser.password
  } as ILoginCredentials);

  const jwt: string = response.body.token;

  return jwt;
}

async function generateUserToken() {
  const user: IApplicationUserData = {
    email: "user@example.com",
    password: "12332112",
    active: true,
    firstName: "Peter",
    lastName: "Smith",
    role: "customer"
  };

  await userService.create(user);

  const response = await request.post(`${API_URL}/login`).send({
    email: user.email,
    password: user.password
  } as ILoginCredentials);

  const jwt: string = response.body.token;

  return jwt;
}

beforeAll(async done => {
  app.once("DB_INITIALIZED", async () => {
    await database.sync({ force: true });

    server = app.listen("6666");
    request = supertest(server);

    done();
  });
});

beforeEach(async () => {
  await resetDatabase();
  adminJwt = await generateAdminToken();
});

describe("User module", () => {
  describe("POST /user", () => {
    const user: IApplicationUserData = {
      email: "test@example.com",
      password: "12332112",
      active: true,
      firstName: "Jane",
      lastName: "Doe",
      role: "customer"
    };

    it("should create a new user", async () => {
      const response = await request
        .post(`${API_URL}/user`)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send(user);

      const responseBody: IApplicationUserData = response.body;

      expect(response.status).toEqual(CREATED);
      expect(responseBody.email).toEqual(user.email);
      expect(responseBody.firstName).toEqual(user.firstName);
      expect(responseBody.lastName).toEqual(user.lastName);
      expect(responseBody.role).toEqual(user.role);
    });

    it("should fail to create a new user with the same email address", async () => {
      await request
        .post(`${API_URL}/user`)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send(user);

      const response = await request
        .post(`${API_URL}/user`)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send(user);

      expect(response.status).toEqual(UNPROCESSABLE_ENTITY);
      expect(response.body.message).toEqual(
        `User with email ${user.email} has already been registered.`
      );
    });

    it("should not allow unauthenticated users to create new users", async () => {
      const response = await request.post(`${API_URL}/user`);

      expect(response.status).toEqual(UNAUTHORIZED);
    });

    it("should not allow customers to create new users", async () => {
      const token = await generateUserToken();
      const response = await request
        .post(`${API_URL}/user`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(FORBIDDEN);
    });
  });
});

afterAll(() => {
  server.close();
});
