import { defaultConfig } from "../../config/DefaultConfig";
import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { errorHandler } from "../../utils/errorHandler";

/**
 * Module to update a config.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {string} serverId The ID of the server to update.
 * @param {keyof ExtendedClient["config"]} setting The setting to update.
 * @param {number | string} value The value to update the setting to.
 * @returns {boolean} True on successful update.
 */
export const setConfig = async (
  bot: ExtendedClient,
  serverId: string,
  setting: keyof ExtendedClient["configs"][""],
  value: number | string
): Promise<boolean> => {
  try {
    const configData = await bot.db.configs.upsert({
      where: {
        serverId
      },
      create: {
        ...defaultConfig,
        serverId,
        [setting]: value
      },
      update: {
        [setting]: value
      }
    });
    bot.configs[serverId] = configData;
    return true;
  } catch (err) {
    await errorHandler(bot, "set config", err);
    return false;
  }
};
