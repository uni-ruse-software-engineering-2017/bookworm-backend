import { ISequelizeConfig } from "sequelize-typescript";

const dbConfig: { [key: string]: ISequelizeConfig } = {
  test: {
    username: null,
    password: null,
    database: "test",
    dialect: "sqlite",
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    dialect: "postgres"
  }
};

module.exports = dbConfig;
