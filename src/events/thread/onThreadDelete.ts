import { ThreadChannel } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { getConfig } from "../../modules/data/getConfig";
import { errorHandler } from "../../utils/errorHandler";

/**
 * Handles the deletion of a thread.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {ThreadChannel} thread The thread payload from Discord.
 */
export const onThreadDelete = async (
  bot: ExtendedClient,
  thread: ThreadChannel
) => {
  try {
    const config = await getConfig(bot, thread.guild.id);

    if (!config.eventLogChannel) {
      return;
    }

    const channel =
      thread.guild.channels.cache.get(config.eventLogChannel) ||
      (await thread.guild.channels.fetch(config.eventLogChannel));

    if (!channel || !("send" in channel)) {
      return;
    }

    await channel.send({
      content: `${thread.name} has been deleted from <#${thread.parentId}>`
    });
  } catch (err) {
    await errorHandler(bot, "on thread create", err);
  }
};
