import BookPurchase, { IBookPurchase } from "../../models/BookPurchase";
import { stripe } from "../../services/stripe";
import { IApplicationUserData } from "../user/user.contracts";
import cartService from "./cart.service";
import { ICartLine } from "./commerce.contracts";
import purchaseService from "./purchase.service";
const FRONTEND_URL = process.env.FRONTEND_URL;

export interface IPaymentService {
  createCheckoutSession(
    customer: IApplicationUserData,
    cartItems: ICartLine[],
    purchaseId: string
  ): Promise<any>;

  completeCheckout(
    customerId: string,
    purchaseId: string
  ): Promise<IBookPurchase[]>;
}

class PaymentService implements IPaymentService {
  async createCheckoutSession(
    customer: IApplicationUserData,
    cartItems: ICartLine[],
    purchaseId: string
  ): Promise<any> {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: customer.email,
      line_items: cartItems.map(i => ({
        name: i.title,
        description: i.author.name,
        images: [i.coverImage],
        amount: i.price * 100, // the amount is stored in cents
        currency: "usd",
        quantity: 1
      })),
      payment_intent_data: {
        metadata: {
          purchaseId,
          customerId: customer.id
        }
      },
      client_reference_id: customer.id,
      success_url: `${FRONTEND_URL}/payment-successful?purchase_id=${purchaseId}`,
      cancel_url: `${FRONTEND_URL}/payment-failed?purchase_id=${purchaseId}`
    });

    // clear cart items
    await cartService.clear(customer.id);

    return session;
  }

  async completeCheckout(customerId: string, purchaseId: string): Promise<any> {
    const purchase = await purchaseService.getById({
      userId: customerId,
      purchaseId
    });

    // mark the purchase as paid
    purchase.isPaid = true;
    purchase.paidAt = new Date();

    // mark the books as owned by the customer
    const purchasedBooks: IBookPurchase[] = purchase.snapshot.map(item => ({
      bookId: item.id,
      purchaseId: purchaseId,
      snapshot: item
    }));

    await Promise.all([
      purchase.save(),
      BookPurchase.bulkCreate(purchasedBooks)
    ]);

    return purchasedBooks;
  }
}

export default new PaymentService();
