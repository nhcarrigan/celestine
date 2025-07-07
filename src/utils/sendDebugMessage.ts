import { ExtendedClient } from "../interfaces/ExtendedClient";

import { logHandler } from "./logHandler";

/**
 * Sends a log message to the worker log hook.
 *
 * @param {ExtendedClient} _bot The bot's Discord instance.
 * @param {string} message The message to send.
 */
export const sendDebugMessage = async (
  _bot: ExtendedClient,
  message: string
) => {
  await logHandler.log("debug", message);
};
