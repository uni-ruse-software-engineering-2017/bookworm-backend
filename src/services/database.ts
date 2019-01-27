import { ISequelizeConfig, Sequelize } from "sequelize-typescript";
const dbConfig = require("./../config/db-config");

const conf = dbConfig[
  process.env.NODE_ENV || "development"
] as ISequelizeConfig;

const database = new Sequelize({
  ...conf,
  modelPaths: [__dirname + "./../models"],
  operatorsAliases: false,
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
