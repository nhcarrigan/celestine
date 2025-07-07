import { ExtendedClient } from "../interfaces/ExtendedClient";
import { logHandler } from "../utils/logHandler";

/**
 * Validates the environment variables and constructs the object.
 *
 * @returns {ExtendedClient["env"]} The environment variable object to attach to the bot.
 */
export const validateEnv = (): ExtendedClient["env"] => {
  if (!process.env.BOT_TOKEN || !process.env.MONGO_URI) {
    logHandler.log("warn", "Missing environment variables!");
    process.exit(1);
  }

  return {
    token: process.env.BOT_TOKEN,
    mongoUri: process.env.MONGO_URI,
    devMode: process.env.NODE_ENV !== "production"
  };
};
