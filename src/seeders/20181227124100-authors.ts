import Author from "../models/Author";
import { IAuthor } from "../modules/catalog/catalog.contracts";
import database from "../services/database";
import logger from "../services/logger";

"use strict";

(async () => {
  try {
    await database.authenticate();
    await database.sync({ force: false });
  } catch (error) {
    logger.error(error);
  }
})();

module.exports = {
  up: (queryInterface, Sequelize) => {
    const authors: IAuthor[] = [
      {
        name: "Haruki Murakami",
        biography: `Haruki Murakami (村上 春樹 Murakami Haruki, born January 12, 1949) is a Japanese writer. His books and stories have been bestsellers in Japan as well as internationally, with his work being translated into 50 languages[1] and selling millions of copies outside his native country.[2][3] His work has received numerous awards, including the World Fantasy Award, the Frank O'Connor International Short Story Award, the Franz Kafka Prize, and the Jerusalem Prize.`,
        birthDate: new Date("1949-12-01")
      },
      {
        name: "Ernest Hemingway",
        biography: `Ernest Miller Hemingway (July 21, 1899 – July 2, 1961) was an American journalist, novelist, and short-story writer. His economical and understated style—which he termed the iceberg theory—had a strong influence on 20th-century fiction, while his adventurous lifestyle and his public image brought him admiration from later generations. Hemingway produced most of his work between the mid-1920s and the mid-1950s, and he won the Nobel Prize in Literature in 1954. He published seven novels, six short-story collections, and two non-fiction works. Three of his novels, four short story collections, and three non-fiction works were published posthumously. Many of his works are considered classics of American literature.`,
        birthDate: new Date("1899-06-21")
      }
    ];

    return Author.bulkCreate(authors);
  },

  down: (queryInterface, Sequelize) => {
    return Author.truncate({ cascade: true, force: true });
  }
};
