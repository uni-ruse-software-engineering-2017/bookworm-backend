import { Sequelize } from "sequelize-typescript";

const database = new Sequelize({
  database: process.env.DB_NAME,
  dialect: "postgres",
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  modelPaths: [__dirname + "./../models"],
  operatorsAliases: false
});

export default database;
