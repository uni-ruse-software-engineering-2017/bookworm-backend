import { CREATED, NO_CONTENT, OK } from "http-status-codes";
import * as Router from "koa-router";
import withRole from "../../middleware/with-role";
import { IUserProfile } from "../user/user.contracts";
import userService from "../user/user.service";
import { ISubscriptionPlan } from "./commerce.contracts";
import subscriptionService from "./subscription.service";

const SubscriptionPlanController = new Router();

SubscriptionPlanController.get("/", async ctx => {
  ctx.body = await subscriptionService.getPlans();

  return ctx;
});

SubscriptionPlanController.post("/", withRole("admin"), async ctx => {
  const plan: ISubscriptionPlan = ctx.request.body;

  ctx.body = await subscriptionService.createPlan(plan);
  ctx.status = CREATED;

  return ctx;
});

SubscriptionPlanController.patch("/:id", withRole("admin"), async ctx => {
  const plan: Partial<ISubscriptionPlan> = {
    ...ctx.request.body,
    id: ctx.params.id
  };

  ctx.body = await subscriptionService.editPlan(plan);

  return ctx;
});

SubscriptionPlanController.delete("/:id", withRole("admin"), async ctx => {
  await subscriptionService.removePlan(ctx.params.id);

  ctx.status = NO_CONTENT;

  return ctx;
});

SubscriptionPlanController.post(
  "/subscribe",
  withRole("customer"),
  async ctx => {
    const profile = ctx.state.session as IUserProfile;
    const user = await userService.getById(profile.id);
    const plan: { planId: string } = ctx.request.body;

    ctx.body = await subscriptionService.subscribeCustomer(user, plan.planId);

    return ctx;
  }
);

SubscriptionPlanController.post(
  "/unsubscribe",
  withRole("customer"),
  async ctx => {
    const profile = ctx.state.session as IUserProfile;
    const user = await userService.getById(profile.id);

    await subscriptionService.unsubscribeCustomer(user);

    ctx.status = OK;
    ctx.body = {
      success: true
    };

    return ctx;
  }
);

export default SubscriptionPlanController;
