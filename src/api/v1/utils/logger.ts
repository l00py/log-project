import { APP_NAME, LOGGER_LEVEL } from "@/api/v1/configs/logConfig";
import pino from "pino";

const logger = pino({
  name: APP_NAME as string,
  level: LOGGER_LEVEL as string,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
