import { Server } from "http";
import { CREATED, NO_CONTENT, OK } from "http-status-codes";
import "jest-extended";
import { SuperTest, Test } from "supertest";
import { resetDatabase } from "../../../services/database";
import { startTestServer } from "../../../test-server";
import {
  createTestBook,
  generateCustomerAndLogin,
  testAuthor
} from "../../../util/test-helpers";
import cartService from "../cart.service";
import { ICartContent } from "../commerce.contracts";

const API_URL = "/api";
const ENDPOINT = `${API_URL}/cart`;

// globals
let api: SuperTest<Test> = null;
let server: Server = null;

beforeAll(async done => {
  [server, api] = await startTestServer();
  done();
});

beforeEach(async () => {
  await resetDatabase();
});

describe("Shopping Cart resource", () => {
  describe(`GET ${ENDPOINT}`, () => {
    it("should list all books added to the user's cart", async () => {
      const [customer, jwt] = await generateCustomerAndLogin(api);
      const book = await createTestBook();

      const newCartLine = await cartService.addItem(customer.id, book.id);
      const response = await api
        .get(ENDPOINT)
        .set("Authorization", `Bearer ${jwt}`);

      expect(response.status).toEqual(OK);

      const cart: ICartContent = response.body;

      expect(cart.items).toBeArrayOfSize(1);
      cart.items.forEach(cartLine => {
        expect(cartLine).toContainAllKeys([
          "id",
          "bookId",
          "author",
          "available",
          "price",
          "title",
          "coverImage"
        ]);

        expect(cartLine.author.name).toEqual(testAuthor.name);
        expect(cartLine.price).toEqual(book.price);
        expect(cartLine.title).toEqual(book.title);
        expect(cartLine.coverImage).toEqual(book.coverImage);
        expect(cartLine.available).toEqual(book.available);
        expect(cartLine.id).toEqual(newCartLine.id);
      });
      expect(cart.items).toBeArrayOfSize(1);
      expect(cart.total).toEqual(book.price);
    });

    it("should list an empty cart", async () => {
      const [, jwt] = await generateCustomerAndLogin(api);
      const response = await api
        .get(ENDPOINT)
        .set("Authorization", `Bearer ${jwt}`);

      expect(response.status).toEqual(OK);

      const cart: ICartContent = response.body;
      expect(cart.total).toEqual(0);
      expect(cart.items).toBeEmpty();
      expect(cart.items).toBeArray();
    });
  });

  describe(`POST ${ENDPOINT}`, () => {
    it("should add a book in the cart", async () => {
      const [customer, jwt] = await generateCustomerAndLogin(api);
      const book = await createTestBook();

      const response = await api
        .post(ENDPOINT)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          bookId: book.id
        });

      expect(response.status).toEqual(CREATED);

      const cart = await cartService.getItems(customer.id);

      expect(cart.items).toBeArrayOfSize(1);
      expect(cart.total).toEqual(book.price);
      const addedBook = cart.items[0];
      expect(addedBook.author.name).toEqual(testAuthor.name);
      expect(addedBook.price).toEqual(book.price);
      expect(addedBook.title).toEqual(book.title);
      expect(addedBook.coverImage).toEqual(book.coverImage);
      expect(addedBook.available).toEqual(book.available);
    });

    it("should not add a book which is already in the cart", async () => {
      const [customer, jwt] = await generateCustomerAndLogin(api);
      const book = await createTestBook();

      await cartService.addItem(customer.id, book.id);

      const response = await api
        .post(ENDPOINT)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          bookId: book.id
        });

      expect(response.status).toEqual(422);
      expect(response.body.error).toEqual("Unprocessable Entity");
      expect(response.body.message).toEqual(
        "The book is already added in the cart."
      );
    });

    it("should not add a book which is already purchased by the customer", async () => {
      const [customer, jwt] = await generateCustomerAndLogin(api);
      const book = await createTestBook();

      // purchase the book
      await cartService.addItem(customer.id, book.id);
      await cartService.checkout(customer.id);

      const response = await api
        .post(ENDPOINT)
        .set("Authorization", `Bearer ${jwt}`)
        .send({
          bookId: book.id
        });

      expect(response.status).toEqual(422);
      expect(response.body.error).toEqual("Unprocessable Entity");
      expect(response.body.message).toEqual("User already owns this book.");
    });
  });

  describe(`DELETE ${ENDPOINT}`, () => {
    it("should clear all items in the cart", async () => {
      const [customer, jwt] = await generateCustomerAndLogin(api);
      const book = await createTestBook();
      await cartService.addItem(customer.id, book.id);

      const response = await api
        .delete(ENDPOINT)
        .set("Authorization", `Bearer ${jwt}`);

      expect(response.status).toEqual(NO_CONTENT);

      const cart = await cartService.getItems(customer.id);
      expect(cart.items).toBeArrayOfSize(0);
      expect(cart.total).toEqual(0);
    });
  });

  describe(`DELETE ${ENDPOINT}/:cartLineId`, () => {
    it("should remove a book from the cart", async () => {
      const [customer, jwt] = await generateCustomerAndLogin(api);
      const book = await createTestBook();
      const cartLine = await cartService.addItem(customer.id, book.id);

      const response = await api
        .delete(`${ENDPOINT}/${cartLine.id}`)
        .set("Authorization", `Bearer ${jwt}`);

      expect(response.status).toEqual(NO_CONTENT);

      const cart = await cartService.getItems(customer.id);
      expect(cart.items).toBeArrayOfSize(0);
      expect(cart.total).toEqual(0);
    });
  });
});

afterAll(() => {
  server.close();
});
