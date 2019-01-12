import { Server } from "http";
import {
  CREATED,
  OK,
  UNAUTHORIZED,
  UNPROCESSABLE_ENTITY
} from "http-status-codes";
import "jest-extended";
import { decode } from "jsonwebtoken";
import { SuperTest, Test } from "supertest";
import { resetDatabase } from "../../../services/database";
import { startTestServer } from "../../../test-server";
import { verifyJwt } from "../../../util/jwt";
import {
  customerUser,
  generateCustomerToken
} from "../../../util/test-helpers";
import { ILoginCredentials, ISignUpData } from "../auth.contracts";

const API_URL = "/api";

// globals
let api: SuperTest<Test> = null;
let server: Server = null;

const signUpUser: ISignUpData = {
  email: "test@example.com",
  password: "12332112",
  firstName: "Jane",
  lastName: "Doe"
};

beforeAll(async done => {
  [server, api] = await startTestServer();
  done();
});

beforeEach(async () => {
  await resetDatabase();
});

describe("Authentication resource", () => {
  describe("POST /sign-up", () => {
    it("should register a new user", async () => {
      const response = await api.post(`${API_URL}/sign-up`).send(signUpUser);

      expect(response.status).toEqual(CREATED);
    });

    it("should fail to register a user with already existing email address", async () => {
      await api.post(`${API_URL}/sign-up`).send(signUpUser);

      const response = await api.post(`${API_URL}/sign-up`).send(signUpUser);

      expect(response.status).toEqual(UNPROCESSABLE_ENTITY);
      expect(response.body.message).toEqual(
        `User with email ${signUpUser.email} has already been registered.`
      );
    });

    it("should fail to register a user with no password", async () => {
      const response = await api
        .post(`${API_URL}/sign-up`)
        .send({ email: "test@example.com" });

      expect(response.status).toEqual(UNPROCESSABLE_ENTITY);
      expect(response.body.message).toEqual(`Password is required.`);
    });
  });

  describe("POST /login", () => {
    it("should generate access token for successful login", async () => {
      await generateCustomerToken(api);

      const response = await api.post(`${API_URL}/login`).send({
        email: customerUser.email,
        password: customerUser.password
      } as ILoginCredentials);

      const apiToken: string = response.body.token;

      expect(response.status).toEqual(OK);
      expect(apiToken).toBeString();
      expect(apiToken).not.toBeEmpty();

      const actualDecodedToken = await decode(apiToken);

      expect(actualDecodedToken["sessionId"]).toBeString();
      expect(actualDecodedToken["sessionId"]).not.toBeEmpty();
      expect(actualDecodedToken["iss"]).toEqual(process.env.JWT_ISSUER);

      const isVerified = await verifyJwt(apiToken);
      expect(isVerified).toBeTruthy();
    });

    it("should not generate token for invalid credentials", async () => {
      const response = await api.post(`${API_URL}/login`).send({
        email: "non-existing@example.com",
        password: "blabla"
      } as ILoginCredentials);

      expect(response.status).toEqual(UNAUTHORIZED);
      expect(response.body.message).toEqual("Invalid credentials.");
    });

    it("should not generate token for invalid password", async () => {
      await generateCustomerToken(api);
      const response = await api.post(`${API_URL}/login`).send({
        email: customerUser.email,
        password: "wrong-password"
      } as ILoginCredentials);

      expect(response.status).toEqual(UNAUTHORIZED);
      expect(response.body.message).toEqual("Invalid credentials.");
    });

    it("should not generate token when invalid data is provided", async () => {
      const response = await api.post(`${API_URL}/login`).send({});

      expect(response.status).toEqual(UNPROCESSABLE_ENTITY);
      expect(response.body.message).toEqual(
        "You must provide email address and password."
      );
    });
  });
});

afterAll(() => {
  server.close();
});
