import { Server } from "http";
import {
  CREATED,
  FORBIDDEN,
  NOT_FOUND,
  OK,
  UNAUTHORIZED,
  UNPROCESSABLE_ENTITY
} from "http-status-codes";
import "jest-extended";
import * as supertest from "supertest";
import { resetDatabase } from "../../../services/database";
import { IPaginatedResource } from "../../../services/paginate";
import startTestServer from "../../../test-server";
import {
  generateAdminToken,
  generateCustomerToken
} from "../../../util/test-helpers";
import authorService from "../author.service";
import { IAuthor } from "../catalog.contracts";

const API_URL = "/api";
const ENDPOINT = `${API_URL}/catalog/authors`;

// globals
let request: supertest.SuperTest<supertest.Test> = null;
let server: Server = null;
let adminJwt = "";

const testAuthor: IAuthor = {
  name: "John Doe",
  bornAt: new Date(),
  diedAt: new Date(),
  imageUrl: "https://example.com/author.jpg",
  biography: "A great author."
};

beforeAll(async done => {
  const _ = await startTestServer();
  server = _.server;
  request = _.request;
  done();
});

beforeEach(async () => {
  await resetDatabase();
  adminJwt = await generateAdminToken(request);
});

describe("Author resource", () => {
  describe(`GET ${ENDPOINT}`, () => {
    it("should list all authors with pagination", async () => {
      const response = await request.get(ENDPOINT);

      expect(response.status).toEqual(OK);

      const responseBody: IPaginatedResource<IAuthor> = response.body;

      expect(responseBody.items).toHaveLength(0);
      expect(responseBody.itemsCount).toEqual(0);
      expect(responseBody.page).toEqual(1);
      expect(responseBody.pageSize).toEqual(25);
      expect(responseBody.total).toEqual(0);
    });

    it("should correctly paginate through authors", async () => {
      const authorsToInsert: IAuthor[] = Array.from({ length: 50 }).map(
        (_, i) => {
          return {
            biography: "Biography...",
            bornAt: new Date(),
            diedAt: null,
            imageUrl: "https://example.com/image.jpg",
            name: "John Doe #" + i
          } as IAuthor;
        }
      );

      await Promise.all(
        authorsToInsert.map(author => authorService.create(author))
      );

      const response = await request.get(ENDPOINT).query({
        page_size: 10,
        page: 2
      });

      expect(response.status).toEqual(OK);

      const responseBody: IPaginatedResource<IAuthor> = response.body;

      expect(responseBody.items).toHaveLength(10);
      expect(responseBody.itemsCount).toEqual(10);
      expect(responseBody.page).toEqual(2);
      expect(responseBody.pageSize).toEqual(10);
      expect(responseBody.total).toEqual(50);

      responseBody.items.forEach(author => {
        expect(author).toContainAllKeys([
          "id",
          "name",
          "biography",
          "imageUrl",
          "bornAt",
          "diedAt",
          "createdAt",
          "updatedAt"
        ]);
      });
    });
  });

  describe(`GET ${ENDPOINT}/:authorId`, () => {
    it("should get author record by its ID", async () => {
      const author = await authorService.create(testAuthor);
      const response = await request.get(`${ENDPOINT}/${author.id}`);

      expect(response.status).toEqual(OK);

      const responseBody: IAuthor = response.body;

      expect(responseBody.name).toEqual(testAuthor.name);
      expect(responseBody.biography).toEqual(testAuthor.biography);
      expect(responseBody.id).toEqual(author.id);
      expect(responseBody.books).toEqual([]);
      expect(responseBody.imageUrl).toEqual(testAuthor.imageUrl);
      expect(new Date(responseBody.bornAt)).toEqual(testAuthor.bornAt);
      expect(new Date(responseBody.diedAt)).toEqual(testAuthor.diedAt);
      expect(responseBody).toContainAllKeys([
        "id",
        "name",
        "biography",
        "imageUrl",
        "bornAt",
        "diedAt",
        "createdAt",
        "updatedAt",
        "books"
      ]);
    });

    it("should have status 404 when author with that ID does not exist", async () => {
      const response = await request.get(`${ENDPOINT}/42`);

      expect(response.status).toEqual(NOT_FOUND);
    });
  });

  describe(`PATCH ${ENDPOINT}/:authorId`, () => {
    it("should update author record with the data provided", async () => {
      const author = await authorService.create(testAuthor);

      const updates: Partial<IAuthor> = {
        name: "Jane Doe",
        biography: "A better writer",
        imageUrl: "https://example.com/updated-image.jpg"
      };

      const response = await request
        .patch(`${ENDPOINT}/${author.id}`)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send(updates);

      expect(response.status).toEqual(OK);

      // check if the response has the updated values
      const responseBody: IAuthor = response.body;
      expect(responseBody.name).toEqual(updates.name);
      expect(responseBody.biography).toEqual(updates.biography);
      expect(responseBody.imageUrl).toEqual(updates.imageUrl);

      // check if the record is persisted
      const updatedAuthor = await authorService.getById(author.id);
      expect(updatedAuthor.name).toEqual(updates.name);
      expect(updatedAuthor.biography).toEqual(updates.biography);
      expect(updatedAuthor.imageUrl).toEqual(updates.imageUrl);
    });

    it("should respond with status 404 when an author does not exist", async () => {
      const response = await request
        .patch(`${ENDPOINT}/42`)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send({});

      expect(response.status).toBe(NOT_FOUND);
    });

    it("should not allow author updates by unauthenticated users", async () => {
      const author = await authorService.create(testAuthor);
      const response = await request.patch(`${ENDPOINT}/${author.id}`).send({});

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("should not allow author updates by customers", async () => {
      const customerToken = await generateCustomerToken(request);
      const author = await authorService.create(testAuthor);
      const response = await request
        .patch(`${ENDPOINT}/${author.id}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({});

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe(`POST ${ENDPOINT}`, () => {
    it("should create a new author", async () => {
      const response = await request
        .post(ENDPOINT)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send(testAuthor);

      const responseBody: IAuthor = response.body;

      expect(response.status).toEqual(CREATED);
      expect(responseBody.biography).toEqual(testAuthor.biography);
      expect(responseBody.name).toEqual(testAuthor.name);
      expect(new Date(responseBody.bornAt)).toEqual(testAuthor.bornAt);
      expect(new Date(responseBody.diedAt)).toEqual(testAuthor.diedAt);
      expect(responseBody.imageUrl).toEqual(testAuthor.imageUrl);
    });

    it("should not create a new author with an existing author's name", async () => {
      await request
        .post(ENDPOINT)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send(testAuthor);

      const response = await request
        .post(ENDPOINT)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send(testAuthor);

      expect(response.status).toEqual(UNPROCESSABLE_ENTITY);
      expect(response.body.message).toEqual(
        `Author with name ${testAuthor.name} already exists.`
      );
    });

    it("should not allow unauthenticated users to create new authors", async () => {
      const response = await request.post(ENDPOINT).send(testAuthor);

      expect(response.status).toEqual(UNAUTHORIZED);
    });

    it("should not allow customers to create new authors", async () => {
      const token = await generateCustomerToken(request);
      const response = await request
        .post(ENDPOINT)
        .send(testAuthor)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(FORBIDDEN);
    });
  });
});

afterAll(() => {
  server.close();
});
