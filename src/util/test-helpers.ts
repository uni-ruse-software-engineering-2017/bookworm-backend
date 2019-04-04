import { SuperTest, Test } from "supertest";
import ApplicationUser from "../models/ApplicationUser";
import { ILoginCredentials } from "../modules/auth/auth.contracts";
import authorService from "../modules/catalog/author.service";
import bookService from "../modules/catalog/book.service";
import {
  IAuthor,
  IBook,
  ICategory
} from "../modules/catalog/catalog.contracts";
import categoryService from "../modules/catalog/category.service";
import { IApplicationUserData } from "../modules/user/user.contracts";
import userService from "../modules/user/user.service";

const API_URL = "/api";

export const adminUser: IApplicationUserData = {
  email: "admin@example.com",
  password: "12332112",
  active: true,
  firstName: "John",
  lastName: "Doe",
  role: "admin"
};

export const customerUser: IApplicationUserData = {
  email: "user@example.com",
  password: "12332112",
  active: true,
  firstName: "Peter",
  lastName: "Smith",
  role: "customer"
};

export const testCategory: ICategory = {
  name: "Science fiction",
  seoUrl: "sci-fi"
};

export const testAuthor: IAuthor = {
  name: "John Doe",
  bornAt: new Date(),
  diedAt: new Date(),
  imageUrl: "https://example.com/author.jpg",
  biography: "A great author."
};

export const testBook: IBook = {
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

export async function createTestCategory() {
  return categoryService.create(testCategory);
}

export async function createTestAuthor() {
  return authorService.create(testAuthor);
}

export async function createTestBook() {
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

export async function generateAdminToken(api: SuperTest<Test>) {
  await userService.create(adminUser);

  const response = await api.post(`${API_URL}/login`).send({
    email: adminUser.email,
    password: adminUser.password
  } as ILoginCredentials);

  const jwt: string = response.body.token;

  return jwt;
}

export async function generateCustomerToken(api: SuperTest<Test>) {
  await userService.create(customerUser);

  const response = await api.post(`${API_URL}/login`).send({
    email: customerUser.email,
    password: customerUser.password
  } as ILoginCredentials);

  const jwt: string = response.body.token;

  return jwt;
}

export async function generateCustomerAndLogin(
  api: SuperTest<Test>
): Promise<[ApplicationUser, string]> {
  const customer = await userService.create(customerUser);

  const response = await api.post(`${API_URL}/login`).send({
    email: customerUser.email,
    password: customerUser.password
  } as ILoginCredentials);

  const jwt: string = response.body.token;

  return [customer, jwt];
}

export const ISBNS = [
  "0-7805-9358-8",
  "0-1452-8704-1",
  "0-4644-5327-5",
  "0-7722-8509-8",
  "0-6579-9316-6",
  "0-2873-7731-8",
  "0-1157-8694-5",
  "0-6157-0870-6",
  "0-1269-6663-X",
  "0-8107-0147-2",
  "0-9381-4017-5",
  "0-9690-9753-0",
  "0-4047-1656-3",
  "0-3862-4973-3",
  "0-9099-0121-X",
  "0-3702-3088-4",
  "0-7218-0062-9",
  "0-6982-9048-8",
  "0-5753-2123-7",
  "0-8416-4139-0",
  "0-7683-1784-3",
  "0-2723-1119-7",
  "0-7301-2420-7",
  "0-5570-6055-9",
  "0-7679-5475-0",
  "0-9197-9134-4",
  "0-2973-0467-4",
  "0-2403-6786-3",
  "0-9773-7946-9",
  "0-1259-8259-3",
  "0-4423-9666-X",
  "0-6606-3841-X",
  "0-8945-7795-6",
  "0-8041-6583-1",
  "0-1052-8971-X",
  "0-6544-6891-5",
  "0-7911-5480-7",
  "0-7572-2963-8",
  "0-7570-8962-3",
  "0-4541-6002-X",
  "0-3621-8887-4",
  "0-4192-6998-3",
  "0-2439-1502-0",
  "0-2500-7963-1",
  "0-9180-2532-X",
  "0-3757-5675-2",
  "0-1735-5562-4",
  "0-6139-7949-4",
  "0-7075-2018-5",
  "0-2450-2159-0"
];
