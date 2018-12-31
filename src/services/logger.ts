import { createLogger, transports } from "winston";

const logger = createLogger({
  level: "debug",
  transports: [new transports.File({ filename: "app.log" })]
});

if (process.env.NODE_ENV !== "test") {
  logger.add(new transports.Console());
}

export default logger;
