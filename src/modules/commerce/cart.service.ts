import { badData, badRequest, notFound } from "boom";
import Author from "../../models/Author";
import Book from "../../models/Book";
import BookPurchase, { IBookPurchase } from "../../models/BookPurchase";
import Purchase from "../../models/Purchase";
import ShoppingCart from "../../models/ShoppingCart";
import userService from "../user/user.service";
import { ICartContent, ICartLine } from "./commerce.contracts";

const cartLineScope = [
  {
    model: Book,
    include: [{ model: Author, attributes: ["name", "id"] }]
  }
];

export interface ICartService {
  getItems(email: string): Promise<ICartContent>;

  addItem(userId: string, bookId: string): Promise<ICartLine>;

  getCartLine(cartLineId: string): Promise<ICartLine>;

  removeItem(userId: string, cartLineId: string): Promise<void>;

  clear(userId: string): Promise<void>;

  checkout(userId: string): Promise<any>;
}

const toCartLine = (item: ShoppingCart) => {
  return <ICartLine>{
    author: {
      id: item.book.author.id,
      name: item.book.author.name
    },
    available: item.book.available,
    title: item.book.title,
    coverImage: item.book.coverImage,
    id: item.id,
    price: item.book.price,
    bookId: item.book.id
  };
};

class CartService implements ICartService {
  async getItems(userId: string) {
    const cartItems = await ShoppingCart.findAll({
      where: {
        userId: userId
      },
      include: cartLineScope
    });

    const items = cartItems.map(toCartLine);

    // TODO: calculate it in the DB layer
    const total = items.reduce((acc, curr) => {
      acc += parseFloat(curr.price + "");
      return acc;
    }, 0);

    return {
      items,
      total
    } as ICartContent;
  }

  async addItem(userId: string, bookId: string) {
    try {
      const user = await userService.getById(userId);

      if (!user) {
        throw badRequest("User does not exist.");
      }

      const purchasedBookIds = await user.purchasedBooks();

      if (purchasedBookIds.has(bookId)) {
        throw badData("User already owns this book.");
      }

      const cartLine = await ShoppingCart.create({ userId, bookId });

      const addedItem = await this.getCartLine(cartLine.id);

      return addedItem;
    } catch (error) {
      if (error.name === "SequelizeForeignKeyConstraintError") {
        if (error.index === "shopping_cart_user_id_fkey") {
          throw badData("User does not exist.");
        }
        if (error.index === "shopping_cart_book_id_fkey") {
          throw badData("Book does not exist.");
        }

        throw error;
      }

      if (error.name === "SequelizeUniqueConstraintError") {
        throw badData("The book is already added in the cart.");
      }

      throw error;
    }
  }

  async getCartLine(cartLineId: string): Promise<ICartLine> {
    const item = await ShoppingCart.findByPk(cartLineId, {
      include: cartLineScope
    });

    if (!item) {
      throw notFound("Cart line not found.");
    }

    return toCartLine(item);
  }

  async removeItem(userId: string, cartLineId: string) {
    const removedCount = await ShoppingCart.destroy({
      where: {
        id: cartLineId,
        userId
      }
    });

    if (removedCount === 0) {
      throw notFound();
    }

    return;
  }

  async clear(userId: string) {
    await ShoppingCart.destroy({
      where: {
        userId
      }
    });

    return;
  }

  async checkout(userId: string): Promise<any> {
    // TODO: integrate with a payment gateway API
    const cartItems = await this.getItems(userId);

    if (!cartItems.items.length) {
      throw badData("Checkout failed because there are no items in the cart.");
    }

    // create the purchase record
    const purchase = await Purchase.create({
      isPaid: true,
      paidAt: new Date(),
      paymentMethod: "card",
      placedAt: new Date(),
      userId: userId,
      snapshot: cartItems.items
    });

    const purchasedBooks: IBookPurchase[] = cartItems.items.map(item => {
      const purchasedBook: IBookPurchase = {
        bookId: item.bookId,
        purchaseId: purchase.id,
        snapshot: item
      };
      return purchasedBook;
    });

    // 2. add books references to the purchase
    await BookPurchase.bulkCreate(purchasedBooks);

    // 3. clear cart items
    await this.clear(userId);

    return purchase;
  }
}

export default new CartService();
