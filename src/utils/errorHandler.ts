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
  _bot: ExtendedClient,
  context: string,
  err: unknown
) => {
  const id = SnowflakeUtil.generate();
  const error = err as Error;
  void logHandler.error(
    context,
    error
  )
  return id;
};
