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
