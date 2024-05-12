import { PrismaClient } from "@prisma/client";

import { ExtendedClient } from "../interfaces/ExtendedClient";
import { errorHandler } from "../utils/errorHandler";
import { sendDebugMessage } from "../utils/sendDebugMessage";

/**
 * Connects to the database.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 */
export const connectDatabase = async (bot: ExtendedClient) => {
  try {
    bot.db = new PrismaClient();
    await bot.db.$connect();
    await sendDebugMessage(bot, "Connected to database.");
  } catch (err) {
    await errorHandler(bot, "connect database", err);
  }
};
