import Author from "../models/Author";
import Book from "../models/Book";
import Category from "../models/Category";
import { IBook } from "../modules/catalog/catalog.contracts";
import database from "../services/database";
import logger from "../services/logger";

(async () => {
  try {
    await database.authenticate();
    await database.sync({ force: false });
  } catch (error) {
    logger.error(error);
  }
})();

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const category = await Category.findOne();

    const harukiMurakami = await Author.findOne({
      where: { name: "Haruki Murakami" }
    });
    const ernestHemingway = await Author.findOne({
      where: { name: "Ernest Hemingway" }
    });

    const murakamiBooks: IBook[] = [
      {
        authorId: harukiMurakami.id,
        title: "Kafka on the Shore",
        isbn: "9780375704024",
        summary: `Kafka on the Shore, a tour de force of metaphysical reality, is powered by two remarkable characters: a teenage boy, Kafka Tamura, who runs away from home either to escape a gruesome oedipal prophecy or to search for his long-missing mother and sister; and an aging simpleton called Nakata, who never recovered from a wartime affliction and now is drawn toward Kafka for reasons that, like the most basic activities of daily life, he cannot fathom. Their odyssey, as mysterious to them as it is to us, is enriched throughout by vivid accomplices and mesmerizing events. Cats and people carry on conversations, a ghostlike pimp employs a Hegel-quoting prostitute, a forest harbors soldiers apparently unaged since World War II, and rainstorms of fish (and worse) fall from the sky. There is a brutal murder, with the identity of both victim and perpetrator a riddle—yet this, along with everything else, is eventually answered, just as the entwined destinies of Kafka and Nakata are gradually revealed, with one escaping his fate entirely and the other given a fresh start on his own.`,
        price: 8.63,
        pages: 467,
        datePublished: new Date(),
        categoryId: category.id,
        available: true,
        coverImage: "https://images.gr-assets.com/books/1429638085l/4929.jpg",
        featured: true,
        freeDownload: false
      },
      {
        authorId: harukiMurakami.id,
        title: "Norwegian Wood",
        isbn: "9780375704025",
        summary: `Toru, a quiet and preternaturally serious young college student in Tokyo, is devoted to Naoko, a beautiful and introspective young woman, but their mutual passion is marked by the tragic death of their best friend years before. Toru begins to adapt to campus life and the loneliness and isolation he faces there, but Naoko finds the pressures and responsibilities of life unbearable. As she retreats further into her own world, Toru finds himself reaching out to others and drawn to a fiercely independent and sexually liberated young woman.`,
        price: 9.52,
        pages: 296,
        datePublished: new Date(),
        categoryId: category.id,
        available: true,
        coverImage: "https://images.gr-assets.com/books/1386924361l/11297.jpg",
        featured: true,
        freeDownload: false
      }
    ];

    const hemingwayBooks: IBook[] = [
      {
        authorId: ernestHemingway.id,
        title: "For Whom the Bell Tolls",
        isbn: "9780684803357",
        summary: `In 1937 Ernest Hemingway traveled to Spain to cover the civil war there for the North American Newspaper Alliance. Three years later he completed the greatest novel to emerge from "the good fight", For Whom the Bell Tolls. `,
        price: 6.31,
        pages: 471,
        datePublished: new Date(),
        categoryId: category.id,
        available: true,
        coverImage: "https://images.gr-assets.com/books/1492591524l/46170.jpg",
        featured: true,
        freeDownload: false
      },
      {
        authorId: ernestHemingway.id,
        title: "The Old Man and the Sea",
        isbn: "9780684830490",
        summary: `The last novel Ernest Hemingway saw published, The Old Man and the Sea has proved itself to be one of the enduring works of American fiction. It is the story of an old Cuban fisherman and his supreme ordeal: a relentless, agonizing battle with a giant marlin far out in the Gulf Stream.`,
        price: 4.5,
        pages: 132,
        datePublished: new Date(),
        categoryId: category.id,
        available: true,
        coverImage: "https://images.gr-assets.com/books/1329189714l/2165.jpg",
        featured: true,
        freeDownload: false
      }
    ];

    try {
      await Book.bulkCreate([...murakamiBooks, ...hemingwayBooks]);
    } catch (error) {
      console.error(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await Book.truncate({ cascade: true, force: true });
    } catch (error) {
      console.error(error);
    }
  }
};
