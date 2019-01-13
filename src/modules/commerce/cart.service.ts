import { badData, notFound } from "boom";
import Author from "../../models/Author";
import Book from "../../models/Book";
import ShoppingCart from "../../models/ShoppingCart";
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

  // checkout(): Promise<void>;
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
        throw badData("Book already added.");
      }

      throw error;
    }
  }

  async getCartLine(cartLineId: string): Promise<ICartLine> {
    const item = await ShoppingCart.findByPrimary(cartLineId, {
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

  // TODO: checkout
}

export default new CartService();
