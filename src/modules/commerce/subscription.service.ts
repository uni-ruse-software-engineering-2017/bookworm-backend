import { badData, notFound } from "boom";
import { addHours, addMonths } from "date-fns";
import { Op } from "sequelize";
import ApplicationUser from "../../models/ApplicationUser";
import StartedReadingBook from "../../models/StartedReadingBook";
import SubscriptionPlan from "../../models/SubscriptionPlan";
import UserSubscription from "../../models/UserSubscription";
import { IPaginatedResource, IPaginationQuery } from "../../services/paginate";
import bookService from "../catalog/book.service";
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
    const oneMonthFromNow = addMonths(now, 1);

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
      throw badData("You are not subscribed to a plan.");
    }

    await customer.subscription.destroy();
  }

  async renewSubscription(subscription: UserSubscription) {
    // TODO: process payment
    const paymentSuccessful = true;

    if (paymentSuccessful) {
      const now = new Date();
      subscription.lastRenewedAt = now;
      subscription.expiresAt = addMonths(now, 1);

      return subscription.save();
    } else {
      return subscription.destroy();
    }
  }

  getSubcribers(
    query: IPaginationQuery<IUserProfile>
  ): Promise<IPaginatedResource<IUserProfile>> {
    throw new Error("Method not implemented.");
  }

  async getExpiringSubscriptions() {
    const now = new Date();
    const oneHourFromNow = addHours(now, 1);

    return UserSubscription.findAll({
      where: {
        expiresAt: {
          [Op.between]: [now, oneHourFromNow]
        }
      }
    });
  }

  async startReadingBook(customer: ApplicationUser, bookId: string) {
    if (!customer.subscription) {
      throw badData(
        "You are not a subscriber! Subscribe for a plan if you want to read books without purchasing them."
      );
    }

    const book = await bookService.getById(bookId);

    if (customer.purchasedBooks.has(book.id)) {
      throw badData("You already have purchased this book.");
    }

    const booksStartedThisMonthCount = await StartedReadingBook.count({
      where: {
        userId: customer.id,
        userSubscriptionId: customer.subscription.id,
        startedAt: {
          [Op.between]: [
            customer.subscription.subscribedAt,
            customer.subscription.expiresAt
          ]
        }
      }
    });

    if (booksStartedThisMonthCount > customer.subscription.booksPerMonth) {
      throw badData(
        `You have reached your books reading quota (${
          customer.subscription.booksPerMonth
        } books) for this month.`
      );
    }

    try {
      const bookStarted = await StartedReadingBook.create({
        bookId: bookId,
        startedAt: new Date(),
        userId: customer.id,
        userSubscriptionId: customer.subscription.id
      });

      return bookStarted;
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw badData("You can already read this book online.");
      }

      throw error;
    }
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
