import { badData, notFound } from "boom";
import ApplicationUser from "../../models/ApplicationUser";
import SubscriptionPlan from "../../models/SubscriptionPlan";
import UserSubscription from "../../models/UserSubscription";
import { IPaginatedResource, IPaginationQuery } from "../../services/paginate";
import { IUserProfile } from "../user/user.contracts";
import { ISubscriptionPlan } from "./commerce.contracts";

export interface ISubscriptionService {
  createPlan(planData: ISubscriptionPlan): Promise<ISubscriptionPlan>;

  editPlan(updates: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan>;

  getPlans(): Promise<ISubscriptionPlan[]>;

  removePlan(planId: string): Promise<void>;

  subscribeCustomer(
    customer: ApplicationUser,
    planId: string
  ): Promise<UserSubscription>;

  unsubscribeCustomer(customer: ApplicationUser): Promise<void>;

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

  async getPlanById(planId: string) {
    const plan = await SubscriptionPlan.findByPrimary(planId);

    if (!plan) {
      throw notFound(`Subscription plan with ID ${planId} was not found.`);
    }

    return plan;
  }

  async editPlan(
    updates: Partial<ISubscriptionPlan> = {}
  ): Promise<ISubscriptionPlan> {
    const plan = await this.getPlanById(updates.id);

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
    const plan = await this.getPlanById(planId);

    await this.checkIfThereAreUsersSubscribed(planId);

    await plan.destroy();
  }

  async subscribeCustomer(
    customer: ApplicationUser,
    planId: string
  ): Promise<UserSubscription> {
    if (!customer) {
      throw notFound("Customer profile not provided.");
    }

    if (customer.subscription) {
      throw badData("You are already subscribed to a plan.");
    }

    const subscriptionPlan = await this.getPlanById(planId);
    const now = new Date();
    const oneMonthFromNow = new Date(
      new Date().setMonth(new Date().getMonth() + 1)
    );

    try {
      const userSubscription = await UserSubscription.create({
        booksPerMonth: subscriptionPlan.booksPerMonth,
        name: subscriptionPlan.name,
        pricePerMonth: subscriptionPlan.pricePerMonth,
        subscriptionPlanId: subscriptionPlan.id,
        subscribedAt: now,
        expiresAt: oneMonthFromNow,
        userId: customer.id
      });

      return userSubscription;
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw badData("You are already subscribed to a plan.");
      }

      throw error;
    }
  }

  async unsubscribeCustomer(customer: ApplicationUser): Promise<void> {
    if (!customer) {
      throw notFound("Customer profile not provided.");
    }

    if (!customer.subscription) {
      throw badData("You not subscribed to a plan.");
    }

    customer.subscription.get();
    await customer.subscription.destroy();
  }

  getSubcribers(
    query: IPaginationQuery<IUserProfile>
  ): Promise<IPaginatedResource<IUserProfile>> {
    throw new Error("Method not implemented.");
  }

  private async checkIfThereAreUsersSubscribed(planId: string) {
    const subscribersCount = await UserSubscription.count({
      where: {
        subscriptionPlanId: planId
      }
    });

    if (subscribersCount > 0) {
      throw badData(
        `Cannot delete plan since there are ${subscribersCount} users who are subscribed to it.`
      );
    }
  }
}

export default new SubscriptionService();
