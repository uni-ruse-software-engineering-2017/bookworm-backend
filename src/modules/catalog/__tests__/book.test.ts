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
import { SuperTest, Test } from "supertest";
import { resetDatabase } from "../../../services/database";
import { IPaginatedResource } from "../../../services/paginate";
import { startTestServer } from "../../../test-server";
import {
  generateAdminToken,
  generateCustomerToken
} from "../../../util/test-helpers";
import authorService from "../author.service";
import bookService from "../book.service";
import { IAuthor, IBook, ICategory } from "../catalog.contracts";
import categoryService from "../category.service";

const API_URL = "/api";
const ENDPOINT = `${API_URL}/catalog/books`;

// globals
let api: SuperTest<Test> = null;
let server: Server = null;
let adminJwt = "";

const testCategory: ICategory = {
  name: "Science fiction",
  seoUrl: "sci-fi"
};

const testAuthor: IAuthor = {
  name: "John Doe",
  bornAt: new Date(),
  diedAt: new Date(),
  imageUrl: "https://example.com/author.jpg",
  biography: "A great author."
};

const testBook: IBook = {
  title: "A Book",
  summary: "The book's summary...",
  pages: 100,
  available: true,
  coverImage: "https://example.com/book-cover.jpg",
  datePublished: new Date(),
  featured: false,
  freeDownload: false,
  isbn: "9783161484100",
  price: 6.78
};

const detailedScopeKeys = [
  "isbn",
  "id",
  "title",
  "pages",
  "datePublished",
  "summary",
  "price",
  "coverImage",
  "freeDownload",
  "available",
  "featured",
  "createdAt",
  "updatedAt",
  "authorId",
  "categoryId",
  "category",
  "author"
];

const listViewScopeKeys = [
  "id",
  "title",
  "price",
  "coverImage",
  "featured",
  "available",
  "category",
  "author"
];

async function createTestCategory() {
  return categoryService.create(testCategory);
}

async function createTestAuthor() {
  return authorService.create(testAuthor);
}

async function createTestBook() {
  const [category, author] = await Promise.all([
    createTestCategory(),
    createTestAuthor()
  ]);

  const book: IBook = {
    ...testBook,
    authorId: author.id,
    categoryId: category.id
  };

  return bookService.create(book);
}

beforeAll(async done => {
  [server, api] = await startTestServer();
  done();
});

beforeEach(async () => {
  await resetDatabase();
  adminJwt = await generateAdminToken(api);
});

describe("Book resource", () => {
  describe(`GET ${ENDPOINT}`, () => {
    it("should list all books with pagination", async () => {
      const response = await api.get(ENDPOINT);

      expect(response.status).toEqual(OK);

      const responseBody: IPaginatedResource<IBook> = response.body;

      expect(responseBody.items).toHaveLength(0);
      expect(responseBody.itemsCount).toEqual(0);
      expect(responseBody.page).toEqual(1);
      expect(responseBody.pageSize).toEqual(25);
      expect(responseBody.total).toEqual(0);
    });

    it("should correctly paginate through books", async () => {
      const [author, category] = await Promise.all([
        createTestAuthor(),
        createTestCategory()
      ]);
      const booksToInsert: IBook[] = Array.from({ length: 50 }).map((_, i) => {
        const book: IBook = {
          title: "Book #" + i,
          pages: 100,
          available: true,
          coverImage: "https://example.com/book-cover.jpg",
          datePublished: new Date(),
          featured: false,
          freeDownload: false,
          isbn: `97831614841${i}`,
          price: 6.78,
          authorId: author.id,
          categoryId: category.id
        };

        return book;
      });

      await Promise.all(booksToInsert.map(book => bookService.create(book)));

      const response = await api.get(ENDPOINT).query({
        page_size: 10,
        page: 2
      });

      expect(response.status).toEqual(OK);

      const responseBody: IPaginatedResource<IBook> = response.body;

      expect(responseBody.items).toHaveLength(10);
      expect(responseBody.itemsCount).toEqual(10);
      expect(responseBody.page).toEqual(2);
      expect(responseBody.pageSize).toEqual(10);
      expect(responseBody.total).toEqual(50);

      responseBody.items.forEach(book => {
        expect(book).toContainAllKeys(listViewScopeKeys);
      });
    });
  });

  describe(`GET ${ENDPOINT}/:bookId`, () => {
    it("should get category record by its ID", async () => {
      const book = await createTestBook();

      const response = await api.get(`${ENDPOINT}/${book.id}`);

      expect(response.status).toEqual(OK);

      const responseBody: IBook = response.body;

      expect(responseBody.id).toEqual(book.id);
      expect(responseBody.title).toEqual(book.title);
      expect(responseBody.available).toEqual(book.available);
      expect(responseBody.summary).toEqual(book.summary);
      expect(responseBody.isbn).toEqual(book.isbn);
      expect(responseBody).toContainAllKeys(detailedScopeKeys);
    });

    it("should have status 404 when book with that ID does not exist", async () => {
      const response = await api.get(`${ENDPOINT}/42`);

      expect(response.status).toEqual(NOT_FOUND);
    });
  });

  describe(`PATCH ${ENDPOINT}/:bookId`, () => {
    it("should update book record with the data provided", async () => {
      const book = await createTestBook();

      const updates: Partial<IBook> = {
        title: "updated title",
        pages: 1
      };

      const response = await api
        .patch(`${ENDPOINT}/${book.id}`)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send(updates);

      expect(response.status).toEqual(OK);

      // check if the response has the updated values
      const responseBody: IBook = response.body;
      expect(responseBody.title).toEqual(updates.title);
      expect(responseBody.pages).toEqual(updates.pages);

      // check if the record is persisted
      const updatedBook = await bookService.getById(book.id);
      expect(updatedBook.title).toEqual(updates.title);
      expect(updatedBook.pages).toEqual(updates.pages);
    });

    it("should set book's author", async () => {
      const book = await createTestBook();
      const author = await authorService.create({
        name: "Author",
        bornAt: new Date(),
        biography: "bio"
      });

      const response = await api
        .patch(`${ENDPOINT}/${book.id}`)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send({
          authorId: author.id
        });

      expect(response.status).toEqual(OK);

      // check if the response has the updated values
      const responseBody: IBook = response.body;
      expect(responseBody.authorId).toEqual(author.id);

      // check if the record is persisted
      const updatedBook = await bookService.getById(book.id);
      expect(updatedBook.author.toJSON()).toEqual({
        id: author.id,
        bornAt: author.bornAt,
        name: author.name
      });
    });

    it("should respond with status 404 when a book does not exist", async () => {
      const response = await api
        .patch(`${ENDPOINT}/42`)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send({});

      expect(response.status).toBe(NOT_FOUND);
    });

    it("should not allow book updates by unauthenticated users", async () => {
      const category = await categoryService.create(testCategory);
      const response = await api.patch(`${ENDPOINT}/${category.id}`).send({});

      expect(response.status).toBe(UNAUTHORIZED);
    });

    it("should not allow book updates by customers", async () => {
      const book = await createTestBook();
      const customerToken = await generateCustomerToken(api);
      const response = await api
        .patch(`${ENDPOINT}/${book.id}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({});

      expect(response.status).toBe(FORBIDDEN);
    });
  });

  describe(`POST ${ENDPOINT}`, () => {
    it("should create a new book", async () => {
      const [author, category] = await Promise.all([
        createTestAuthor(),
        createTestCategory()
      ]);
      const book: IBook = {
        ...testBook,
        authorId: author.id,
        categoryId: category.id
      };
      const response = await api
        .post(ENDPOINT)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send(book);

      const responseBody: IBook = response.body;

      expect(response.status).toEqual(CREATED);
      expect(responseBody.title).toEqual(book.title);
      expect(responseBody.available).toEqual(book.available);
      expect(responseBody.coverImage).toEqual(book.coverImage);
      expect(responseBody.available).toEqual(book.available);
      expect(responseBody).toContainAllKeys(detailedScopeKeys);
    });

    it("should not create a new category with an existing category's name", async () => {
      await api
        .post(ENDPOINT)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send(testCategory);

      const response = await api
        .post(ENDPOINT)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send(testCategory);

      expect(response.status).toEqual(UNPROCESSABLE_ENTITY);
      expect(response.body.message).toEqual("Validation failed.");
    });

    it("should not create a new book with an existing ISBN", async () => {
      await createTestBook();
      const book: IBook = {
        available: true,
        datePublished: new Date(),
        featured: true,
        freeDownload: false,
        isbn: "9783161484100",
        coverImage: "https://example.com/cover.jpg",
        pages: 100,
        price: 10,
        title: "Another book",
        authorId: "1",
        categoryId: "1"
      };

      const response = await api
        .post(ENDPOINT)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send(book);

      expect(response.status).toEqual(UNPROCESSABLE_ENTITY);
      expect(response.body.message).toEqual("Validation failed.");
    });

    it("should not allow unauthenticated users to create new books", async () => {
      const response = await api.post(ENDPOINT).send(testBook);

      expect(response.status).toEqual(UNAUTHORIZED);
    });

    it("should not allow customers to create new books", async () => {
      const token = await generateCustomerToken(api);
      const response = await api
        .post(ENDPOINT)
        .send(testBook)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(FORBIDDEN);
    });
  });
});

afterAll(() => {
  server.close();
});
