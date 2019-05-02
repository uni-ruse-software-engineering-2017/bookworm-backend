import { badRequest } from "boom";
import { OK } from "http-status-codes";
import * as Router from "koa-router";
import paymentService from "./modules/commerce/payment.service";
import logger from "./services/logger";
import { stripe } from "./services/stripe";

const webhooks = new Router();

webhooks.post("/stripe-webhooks", async ctx => {
  const hook = ctx.request.body;
  const signature = ctx.headers["stripe-signature"];

  try {
    // verify webhook request signature
    stripe.webhooks.constructEvent(
      ctx.request.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    throw badRequest(`Invalid Stripe webhook request signature!`);
  }

  logger.info(`Webhook received.`, hook);

  switch (hook.type) {
    case "payment_intent.succeeded":
      const { purchaseId, customerId } = hook.data.object.metadata;
      await paymentService.completeCheckout(customerId, purchaseId);

      break;

    case "payment_intent.payment_failed":
    case "payment_intent.created":
      break;

    default:
      throw badRequest(`Unsupported Stripe webhook type ${hook.type}.`);
  }

  ctx.status = OK;
  ctx.body = hook.data.object;
  return ctx;
});

export default webhooks;
