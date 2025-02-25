import winston from "winston";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { TransformableInfo } from "logform";

interface LogInfo extends TransformableInfo {
  level: string;
  message: string;
  timestamp?: string;
  errorId?: string;
}

const logFormat = winston.format.printf((info: TransformableInfo) => {
  const { level, message, timestamp, errorId } = info as LogInfo;
  return `${timestamp} [${level.toUpperCase()}] [ErrorID: ${errorId}] ${message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    logFormat,
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),

    new winston.transports.File({
      filename: path.join(process.cwd(), "./logs/errors.log"),
      level: "error",
    }),
  ],
});

if (process.env.NODE_ENV === "production") {
  logger.remove(new winston.transports.Console());
}

/**
 * logging errors with id
 * @param {Error} Error - The error to log
 * @returns {string} errorId - Id of the error
 */
export const logErrorWithId = (error: Error): string => {
  const errorId = uuidv4();
  logger.error({ errorId, message: error.message, stack: error.stack });
  return errorId;
};

export default logger;
