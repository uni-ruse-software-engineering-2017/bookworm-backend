const Stripe = require("stripe");

export const stripe = new Stripe(process.env.STRIPE_API_KEY);
