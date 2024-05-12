import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { registerCommands } from "../../utils/registerCommands";
import { sendDebugMessage } from "../../utils/sendDebugMessage";

/**
 * Handles the `ready` from Discord.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 */
export const onReady = async (bot: ExtendedClient) => {
  await sendDebugMessage(bot, `Logged in as ${bot.user?.tag}`);
  await registerCommands(bot);
};
