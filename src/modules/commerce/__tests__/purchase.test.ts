import { Server } from "http";
import { OK, UNAUTHORIZED } from "http-status-codes";
import "jest-extended";
import { SuperTest, Test } from "supertest";
import Purchase from "../../../models/Purchase";
import { resetDatabase } from "../../../services/database";
import { IPaginatedResource } from "../../../services/paginate";
import { startTestServer } from "../../../test-server";
import {
  createTestBook,
  generateAdminToken,
  generateCustomerAndLogin
} from "../../../util/test-helpers";
import cartService from "../cart.service";

const API_URL = "/api";
const ENDPOINT = `${API_URL}/purchases`;

// globals
let api: SuperTest<Test> = null;
let server: Server = null;
let adminJwt = "";

beforeAll(async done => {
  [server, api] = await startTestServer();
  done();
});

beforeEach(async () => {
  await resetDatabase();
  adminJwt = await generateAdminToken(api);
});

describe("Purchases resource", () => {
  describe(`GET ${ENDPOINT}`, () => {
    it("should list all purchases with pagination [customer]", async () => {
      const [customer, jwt] = await generateCustomerAndLogin(api);
      const book = await createTestBook();
      await cartService.addItem(customer.id, book.id);
      await cartService.checkout(customer.id);

      const response = await api
        .get(ENDPOINT)
        .set("Authorization", `Bearer ${jwt}`);

      expect(response.status).toEqual(OK);

      const purchases: IPaginatedResource<Purchase> = response.body;

      expect(purchases.items).toBeArrayOfSize(1);
      expect(purchases.total).toEqual(1);
      expect(purchases.page).toEqual(1);

      purchases.items.forEach(purchase => {
        expect(purchase.userId).toEqual(customer.id);
        expect(purchase.snapshot).toBeArray();
      });

      const firstPurchase = purchases.items[0];

      expect(firstPurchase.snapshot[0].author.name).toEqual(book.author.name);
      expect(firstPurchase.snapshot[0].title).toEqual(book.title);
    });

    it("should handle empty list of purchases [customer]", async () => {
      const [, jwt] = await generateCustomerAndLogin(api);
      const response = await api
        .get(ENDPOINT)
        .set("Authorization", `Bearer ${jwt}`);

      expect(response.status).toEqual(OK);

      const responseBody: IPaginatedResource<Purchase> = response.body;
      expect(responseBody.items).toBeArrayOfSize(0);
      expect(responseBody.itemsCount).toEqual(0);
      expect(responseBody.pageCount).toEqual(1);
      expect(responseBody.total).toEqual(0);
    });

    it("should handle empty list of purchases [admin]", async () => {
      const response = await api
        .get(ENDPOINT)
        .set("Authorization", `Bearer ${adminJwt}`);

      expect(response.status).toEqual(OK);

      const responseBody: IPaginatedResource<Purchase> = response.body;
      expect(responseBody.items).toBeArrayOfSize(0);
      expect(responseBody.itemsCount).toEqual(0);
      expect(responseBody.pageCount).toEqual(1);
      expect(responseBody.total).toEqual(0);
    });

    it("should list all purchases in the system with pagination [admin]", async () => {
      // TODO: generate more users and purchases
      const [customer] = await generateCustomerAndLogin(api);
      const book = await createTestBook();
      await cartService.addItem(customer.id, book.id);
      await cartService.checkout(customer.id);
      const response = await api

        .get(ENDPOINT)
        .set("Authorization", `Bearer ${adminJwt}`);

      expect(response.status).toEqual(OK);

      const purchases: IPaginatedResource<Purchase> = response.body;

      expect(purchases.items).toBeArrayOfSize(1);
      expect(purchases.total).toEqual(1);
      expect(purchases.page).toEqual(1);

      purchases.items.forEach(purchase => {
        expect(purchase.userId).toEqual(customer.id);
        expect(purchase.snapshot).toBeArray();
      });

      const firstPurchase = purchases.items[0];

      expect(firstPurchase.snapshot[0].author.name).toEqual(book.author.name);
      expect(firstPurchase.snapshot[0].title).toEqual(book.title);
    });

    it("should not allow unathorized requests", async () => {
      const response = await api.get(ENDPOINT);

      expect(response.status).toEqual(UNAUTHORIZED);
    });
  });
});

afterAll(() => {
  server.close();
});
