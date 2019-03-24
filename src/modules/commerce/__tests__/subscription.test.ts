import { Server } from "http";
import {
  CREATED,
  FORBIDDEN,
  NO_CONTENT,
  OK,
  UNAUTHORIZED
} from "http-status-codes";
import "jest-extended";
import { SuperTest, Test } from "supertest";
import { resetDatabase } from "../../../services/database";
import { startTestServer } from "../../../test-server";
import {
  generateAdminToken,
  generateCustomerToken
} from "../../../util/test-helpers";
import { ISubscriptionPlan } from "../commerce.contracts";
import subscriptionService from "../subscription.service";

const API_URL = "/api";
const ENDPOINT = `${API_URL}/subscription-plans`;

// globals
let api: SuperTest<Test> = null;
let server: Server = null;
let adminJwt = "";

async function createTestPlans() {
  const plans: ISubscriptionPlan[] = [
    {
      booksPerMonth: 5,
      pricePerMonth: 5.0,
      name: "Economic"
    },
    {
      booksPerMonth: 10,
      pricePerMonth: 7.5,
      name: "Premium"
    },
    {
      booksPerMonth: 15,
      pricePerMonth: 10,
      name: "Ultra"
    }
  ];

  const insertedPlans = await Promise.all(
    plans.map(p => subscriptionService.createPlan(p))
  );

  return insertedPlans;
}

beforeAll(async done => {
  [server, api] = await startTestServer();
  done();
});

beforeEach(async () => {
  await resetDatabase();
  adminJwt = await generateAdminToken(api);
});

describe("Subscription plan resource", () => {
  describe(`GET ${ENDPOINT}`, () => {
    it("should list all subscription plans", async () => {
      const testPlans = await createTestPlans();
      const response = await api.get(ENDPOINT);

      expect(response.status).toEqual(OK);

      const plans: ISubscriptionPlan[] = response.body;

      expect(plans).toBeArrayOfSize(testPlans.length);

      plans.forEach((p, i) => {
        const testPlan = testPlans[i];
        expect(p.id).toEqual(testPlan.id);
        expect(p.name).toEqual(testPlan.name);
        expect(p.booksPerMonth).toEqual(testPlan.booksPerMonth);
        expect(p.pricePerMonth).toEqual(testPlan.pricePerMonth);
      });
    });

    it("should respond with empty array when there are no subscription plans", async () => {
      const response = await api.get(ENDPOINT);

      expect(response.status).toEqual(OK);
      expect(response.body).toBeArrayOfSize(0);
    });
  });

  describe(`POST ${ENDPOINT}`, () => {
    it("should create a subscription plan", async () => {
      const testPlan: ISubscriptionPlan = {
        name: "Premium",
        booksPerMonth: 10,
        pricePerMonth: 5
      };

      const response = await api
        .post(ENDPOINT)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send(testPlan);

      const plan: ISubscriptionPlan = response.body;

      expect(response.status).toEqual(CREATED);

      expect(plan.name).toEqual(testPlan.name);
      expect(plan.booksPerMonth).toEqual(testPlan.booksPerMonth);
      expect(plan.pricePerMonth).toEqual(testPlan.pricePerMonth);
    });

    it("should not allow unauthenticated requests", async () => {
      const response = await api.post(ENDPOINT).send({});

      expect(response.status).toEqual(UNAUTHORIZED);
    });

    it("should not allow customers to create plans", async () => {
      const customerJwt = await generateCustomerToken(api);
      const response = await api
        .post(ENDPOINT)
        .set("Authorization", `Bearer ${customerJwt}`)
        .send({});

      expect(response.status).toEqual(FORBIDDEN);
    });
  });

  describe(`PATCH ${ENDPOINT}/:id`, () => {
    it("should update a subscription plan", async () => {
      const premiumPlan = (await createTestPlans())[0];

      const planUpdates: Partial<ISubscriptionPlan> = {
        name: "Ultra Unlimited",
        booksPerMonth: 9999,
        pricePerMonth: 99.99
      };

      const response = await api
        .patch(`${ENDPOINT}/${premiumPlan.id}`)
        .set("Authorization", `Bearer ${adminJwt}`)
        .send(planUpdates);

      const updatedPlan: ISubscriptionPlan = response.body;

      expect(response.status).toEqual(OK);

      expect(updatedPlan.name).toEqual(planUpdates.name);
      expect(updatedPlan.booksPerMonth).toEqual(planUpdates.booksPerMonth);
      expect(updatedPlan.pricePerMonth).toEqual(planUpdates.pricePerMonth);
    });

    it("should not allow unauthenticated requests", async () => {
      const plans = await createTestPlans();

      const response = await api.patch(`${ENDPOINT}/${plans[0].id}`).send({});

      expect(response.status).toEqual(UNAUTHORIZED);
    });

    it("should not allow customers to update plans", async () => {
      const plans = await createTestPlans();
      const customerJwt = await generateCustomerToken(api);
      const response = await api
        .patch(`${ENDPOINT}/${plans[0].id}`)
        .set("Authorization", `Bearer ${customerJwt}`)
        .send({});

      expect(response.status).toEqual(FORBIDDEN);
    });
  });

  describe(`DELETE ${ENDPOINT}/:id`, () => {
    it("should delete a subscription plan", async () => {
      const premiumPlan = (await createTestPlans())[0];

      const response = await api
        .delete(`${ENDPOINT}/${premiumPlan.id}`)
        .set("Authorization", `Bearer ${adminJwt}`);

      expect(response.status).toEqual(NO_CONTENT);
    });

    it("should not allow unauthenticated requests", async () => {
      const plans = await createTestPlans();

      const response = await api.delete(`${ENDPOINT}/${plans[0].id}`);

      expect(response.status).toEqual(UNAUTHORIZED);
    });

    it("should not allow customers to delete plans", async () => {
      const plans = await createTestPlans();
      const customerJwt = await generateCustomerToken(api);
      const response = await api
        .delete(`${ENDPOINT}/${plans[0].id}`)
        .set("Authorization", `Bearer ${customerJwt}`);

      expect(response.status).toEqual(FORBIDDEN);
    });
  });
});

afterAll(() => {
  server.close();
});
