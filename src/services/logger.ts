// Winston Logger
import { createLogger, transports } from "winston";

const logger = createLogger({
  level: "debug",
  transports: [
    new transports.Console()
    // new transports.File({ filename: "app.log" })
  ]
});

if (process.env.NODE_ENV === "test") {
  logger.remove(transports.Console);
}

export default logger;
