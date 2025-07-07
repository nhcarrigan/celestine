import { Logger } from "@nhcarrigan/logger";

/**
 * Standard log handler, using winston to wrap and format
 * messages. Call with `logHandler.log(level, message)`.
 *
 * @param {string} level - The log level to use.
 * @param {string} message - The message to log.
 */
export const logHandler = new Logger("Celestine", process.env.LOG_TOKEN ?? "");
