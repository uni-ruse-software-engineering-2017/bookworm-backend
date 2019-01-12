import { ILoginCredentials } from "../modules/auth/auth.contracts";
import { IApplicationUserData } from "../modules/user/user.contracts";
import userService from "../modules/user/user.service";
import supertest = require("supertest");

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

export async function generateAdminToken(
  request: supertest.SuperTest<supertest.Test>
) {
  await userService.create(adminUser);

  const response = await request.post(`${API_URL}/login`).send({
    email: adminUser.email,
    password: adminUser.password
  } as ILoginCredentials);

  const jwt: string = response.body.token;

  return jwt;
}

export async function generateCustomerToken(
  request: supertest.SuperTest<supertest.Test>
) {
  await userService.create(customerUser);

  const response = await request.post(`${API_URL}/login`).send({
    email: customerUser.email,
    password: customerUser.password
  } as ILoginCredentials);

  const jwt: string = response.body.token;

  return jwt;
}
