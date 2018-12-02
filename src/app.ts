require("dotenv-override").config({ override: true });

import * as prettyjson from "prettyjson";
import { Sequelize } from "sequelize-typescript";
import Author from "./models/Author";
import Book from "./models/Book";
import Category from "./models/Category";

(async function() {
  console.log(__dirname);
  const sequelize = new Sequelize({
    database: "bookworm",
    dialect: "postgres",
    username: "postgres",
    password: "postgres",
    modelPaths: [__dirname + "/models"]
  });

  await sequelize.authenticate();

  console.log("Connected!");

  await sequelize.drop({ cascade: true });
  await sequelize.sync({ force: true });

  const author = await Author.create({
    name: "Ivan Vazov"
  } as Author);

  const book = await Book.create({
    authorId: author.id,
    name: "Pod Igoto"
  });

  console.log(prettyjson.render(author.toJSON()));
  console.log(prettyjson.render(book.toJSON()));

  const podIgoto = await Book.findById(1, { include: [Author] });
  console.log(prettyjson.render(podIgoto.toJSON()));

  const fiction = await Category.create({
    name: "Fiction"
  });

  const scienceFiction = await Category.create({
    name: "Science Fiction",
    parent_id: fiction.id
  });

  const fantasy = await Category.create({
    name: "Fantasy",
    parent_id: fiction.id
  });

  const root = await Category.findById(1, {
    include: [{ model: Category, as: "children" }]
  });
  const f = await Category.findById(2, {
    include: [{ model: Category, as: "parent" }]
  });

  console.log(prettyjson.render(fiction.toJSON()));
  console.log(prettyjson.render(scienceFiction.toJSON()));
  console.log(prettyjson.render(fantasy.toJSON()));
  console.log(prettyjson.render(f.toJSON()));
  console.log(prettyjson.render(root.toJSON()));
})();
