import { Server } from "http";
import {
  CREATED,
  FORBIDDEN,
  OK,
  UNAUTHORIZED,
  UNPROCESSABLE_ENTITY
} from "http-status-codes";
import "jest-extended";
import { SuperTest, Test } from "supertest";
import { resetDatabase } from "../../../services/database";
import { IPaginatedResource } from "../../../services/paginate";
import { startTestServer } from "../../../test-server";
import {
  customerUser,
  generateAdminToken,
  generateCustomerToken
} from "../../../util/test-helpers";
import { IApplicationUserData, IUserProfile } from "../user.contracts";
import userService from "../user.service";

const API_URL = "/api";

// globals
let api: SuperTest<Test> = null;
let server: Server = null;
let adminJwt = "";

const testUser: IApplicationUserData = {
  email: "test@example.com",
  password: "12332112",
  active: true,
  firstName: "Jane",
  lastName: "Doe",
  role: "customer"
};

beforeAll(async done => {
  [server, api] = await startTestServer();
  done();
});

beforeEach(async () => {
  await resetDatabase();
  adminJwt = await generateAdminToken(api);
});

describe("User resource", () => {
  describe("GET /user", () => {
    it("should list all users with pagination", async () => {
      await userService.create(testUser);

      const response = await api
        .get(`${API_URL}/user`)
        .set("Authorization", `Bearer ${adminJwt}`);

      expect(response.status).toEqual(OK);

      const responseBody: IPaginatedResource<IApplicationUserData> =
        response.body;

      // there are two users - the admin and the one created in this test case
      expect(responseBody.items).toHaveLength(2);
      expect(responseBody.itemsCount).toEqual(2);
      expect(responseBody.page).toEqual(1);
      expect(responseBody.pageSize).toEqual(25);
      expect(responseBody.total).toEqual(2);
    });

    it("should paginate through users correctly", async () => {
      // bulk insert test users
      const USERS_TO_INSERT = 50;
      const usersToInsert = [];
      for (let i = 0; i < USERS_TO_INSERT; i++) {
        const u = {
          ...testUser,
          email: `${i}_${testUser.email}`
        } as IApplicationUserData;
        usersToInsert.push(u);
      }
      await Promise.all(usersToInsert.map(u => userService.create(u)));

      const PAGE_SIZE = 10;
      const PAGE = 2;
      const response = await api
        .get(`${API_URL}/user`)
        .query({
          page: PAGE,
          page_size: PAGE_SIZE
        })
        .set("Authorization", `Bearer ${adminJwt}`);

      expect(response.status).toEqual(OK);

      const responseBody: IPaginatedResource<IApplicationUserData> =
        response.body;

      expect(responseBody.items).toHaveLength(PAGE_SIZE);
      expect(responseBody.itemsCount).toEqual(PAGE_SIZE);
      expect(responseBody.page).toEqual(PAGE);
      expect(responseBody.pageSize).toEqual(PAGE_SIZE);
      expect(responseBody.total).toEqual(USERS_TO_INSERT + 1);
    });

    it("should not list users for unauthenticated requests", async () => {
      const response = await api.get(`${API_URL}/user`);

      expect(response.status).toEqual(UNAUTHORIZED);
    });

    it("should not list users for customer requests", async () => {
      const customerToken = await generateCustomerToken(api);
      const response = await api
        .get(`${API_URL}/user`)
        .set("Authorization", `Bearer ${customerToken}`);

      expect(response.status).toEqual(FORBIDDEN);
    });
  });

  describe("GET /user/profile", () => {
    it(`should get the current user's profile information`, async () => {
      const token = await generateCustomerToken(api);

      const response = await api
        .get(`${API_URL}/user/profile`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(OK);
      expect(response.body).toContainAllKeys([
        "id",
        "email",
        "firstName",
        "lastName",
        "role",
        "ownedBooks",
        "subscription",
        "gravatarUrl"
      ]);

      const userProfile: IUserProfile = response.body;

      expect(userProfile.email).toEqual(customerUser.email);
      expect(userProfile.firstName).toEqual(customerUser.firstName);
      expect(userProfile.lastName).toEqual(customerUser.lastName);
      expect(userProfile.role).toEqual(customerUser.role);
      expect(userProfile.ownedBooks).toBeArray();
    });

    it(`should only allow authorized requests`, async () => {
      const response = await api.get(`${API_URL}/user/profile`);

      expect(response.status).toEqual(UNAUTHORIZED);
    });
  });

  describe("POST /user", () => {
    it("should create a new user", async () => {
      const response = await api
        .post(`${API_URL}/user`)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send(testUser);

      const responseBody: IApplicationUserData = response.body;

      expect(response.status).toEqual(CREATED);
      expect(responseBody.email).toEqual(testUser.email);
      expect(responseBody.firstName).toEqual(testUser.firstName);
      expect(responseBody.lastName).toEqual(testUser.lastName);
      expect(responseBody.role).toEqual(testUser.role);
    });

    it("should fail to create a new user with the same email address", async () => {
      await api
        .post(`${API_URL}/user`)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send(testUser);

      const response = await api
        .post(`${API_URL}/user`)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send(testUser);

      expect(response.status).toEqual(UNPROCESSABLE_ENTITY);
      expect(response.body.message).toEqual(
        `User with email ${testUser.email} has already been registered.`
      );
    });

    it("should not allow unauthenticated users to create new users", async () => {
      const response = await api.post(`${API_URL}/user`);

      expect(response.status).toEqual(UNAUTHORIZED);
    });

    it("should not allow customers to create new users", async () => {
      const token = await generateCustomerToken(api);
      const response = await api
        .post(`${API_URL}/user`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(FORBIDDEN);
    });
  });
});

afterAll(() => {
  server.close();
});
