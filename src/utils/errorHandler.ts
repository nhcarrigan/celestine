import { SnowflakeUtil } from "discord.js";

import { ExtendedClient } from "../interfaces/ExtendedClient";

import { logHandler } from "./logHandler";

/**
 * Handles logging the error to the terminal and sending it to the debug webhook.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {string} context A brief description of where the error occurred.
 * @param {Error} err The error object.
 * @returns {string} A unique ID to use in logs.
 */
export const errorHandler = async (
  bot: ExtendedClient,
  context: string,
  err: unknown
) => {
  const id = SnowflakeUtil.generate();
  const error = err as Error;
  logHandler.log("error", `${context}: ${error.message}`);
  logHandler.log("error", JSON.stringify(error.stack, null, 2));
  if (bot.env.debugHook) {
    await bot.env.debugHook.send({
      content: `**${id}\n${context}: ${error.message}`,
      avatarURL:
        bot.user?.displayAvatarURL() ??
        "https://cdn.nhcarrigan.com/avatars/nhcarrigan.png",
      username: bot.user?.username ?? "Mod bot"
    });
    await bot.env.debugHook.send({
      content: "```\n" + JSON.stringify(error.stack, null, 2) + "\n```",
      avatarURL:
        bot.user?.displayAvatarURL() ??
        "https://cdn.nhcarrigan.com/avatars/nhcarrigan.png",
      username: bot.user?.username ?? "Mod bot"
    });
  }
  bot.analytics.errorHandled();
  return id;
};
