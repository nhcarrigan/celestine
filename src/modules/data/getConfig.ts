import { configs } from "@prisma/client";

import { defaultConfig } from "../../config/DefaultConfig";
import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { errorHandler } from "../../utils/errorHandler";

/**
 * Module to get the server config from the cache, database, or default.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {string} serverId The ID of the server to get the config for.
 * @returns {ExtendedClient["config"]} The server config.
 */
export const getConfig = async (
  bot: ExtendedClient,
  serverId: string
): Promise<Omit<configs, "id">> => {
  try {
    const exists = bot.configs[serverId];
    if (exists) {
      return exists;
    }
    const record = await bot.db.configs.upsert({
      where: {
        serverId
      },
      create: {
        ...defaultConfig,
        serverId
      },
      update: {}
    });
    bot.configs[serverId] = record;
    return record;
  } catch (err) {
    await errorHandler(bot, "get config", err);
    return defaultConfig;
  }
};
