import { badData, notFound } from "boom";
import SubscriptionPlan from "../../models/SubscriptionPlan";
import { IPaginatedResource, IPaginationQuery } from "../../services/paginate";
import { IUserProfile } from "../user/user.contracts";
import { ISubscriptionPlan } from "./commerce.contracts";

export interface ISubscriptionService {
  createPlan(planData: ISubscriptionPlan): Promise<ISubscriptionPlan>;

  editPlan(updates: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan>;

  getPlans(): Promise<ISubscriptionPlan[]>;

  removePlan(planId: string): Promise<void>;

  subscribeCustomer(customerId: string): Promise<void>;

  unsubscribeCustomer(customerId: string): Promise<void>;

  getSubcribers(
    query: IPaginationQuery<IUserProfile>
  ): Promise<IPaginatedResource<IUserProfile>>;
}

class SubscriptionService implements ISubscriptionService {
  async createPlan(planData: ISubscriptionPlan): Promise<ISubscriptionPlan> {
    planData.booksPerMonth = Math.round(planData.booksPerMonth);

    try {
      const plan = await SubscriptionPlan.create(planData, { validate: true });

      return plan;
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw badData("Subscription plan with that name already exists");
      } else if (error.name === "SequelizeValidationError") {
        throw badData(error);
      }

      throw error;
    }
  }

  async editPlan(
    updates: Partial<ISubscriptionPlan> = {}
  ): Promise<ISubscriptionPlan> {
    const plan = await SubscriptionPlan.findByPrimary(updates.id);

    if (!plan) {
      throw notFound("The subscription plan could not be found.");
    }

    if (updates.name) {
      plan.name = updates.name;
    }

    if (typeof updates.booksPerMonth !== "undefined") {
      plan.booksPerMonth = updates.booksPerMonth;
    }

    if (typeof updates.pricePerMonth !== "undefined") {
      plan.pricePerMonth = updates.pricePerMonth;
    }

    try {
      const updatedPlan = await plan.save();
      return updatedPlan;
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw badData("Subscription plan with that name already exists");
      } else if (error.name === "SequelizeValidationError") {
        throw badData(error);
      }

      throw error;
    }
  }

  async getPlans(): Promise<ISubscriptionPlan[]> {
    const plans = await SubscriptionPlan.findAll({
      order: [["price_per_month", "ASC"]]
    });

    return plans;
  }

  async removePlan(planId: string): Promise<void> {
    const plan = await SubscriptionPlan.findByPrimary(planId);

    if (!plan) {
      throw notFound("The subscription plan could not be found.");
    }

    // TODO: check if there are subscribers first
    await plan.destroy();
  }

  subscribeCustomer(customerId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  unsubscribeCustomer(customerId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  getSubcribers(
    query: IPaginationQuery<IUserProfile>
  ): Promise<IPaginatedResource<IUserProfile>> {
    throw new Error("Method not implemented.");
  }
}

export default new SubscriptionService();
