import { scheduleJob } from "node-schedule";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { maintainSecurity } from "../../modules/maintainSecurity";
import { postBirthdays } from "../../modules/postBirthdays";
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

  // Daily at 9am PST
  scheduleJob("birthdays", "0 9 * * *", async () => await postBirthdays(bot));
  // Daily at midnight and noon
  scheduleJob(
    "birthdays",
    "0 0,12 * * *",
    async () => await maintainSecurity(bot)
  );
};
