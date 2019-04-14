import { Sequelize, SequelizeOptions } from "sequelize-typescript";
const dbConfig = require("./../config/db-config");

const conf = dbConfig[
  process.env.NODE_ENV || "development"
] as SequelizeOptions;

const database = new Sequelize({
  ...conf,
  modelPaths: [__dirname + "./../models"],
  define: {
    underscored: true,
    freezeTableName: true
  }
});

export default database;

export function resetDatabase() {
  const modelsHashMap = database.models;
  const modelsList = Object.keys(modelsHashMap).map(
    modelName => modelsHashMap[modelName]
  );

  return Promise.all(
    modelsList.map(model => model.truncate({ cascade: true, force: true }))
  );
}
