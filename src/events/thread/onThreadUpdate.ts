import { ThreadChannel } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { getConfig } from "../../modules/data/getConfig";
import { errorHandler } from "../../utils/errorHandler";

/**
 * Handles a thread update.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {ThreadChannel} oldThread The old thread payload.
 * @param {ThreadChannel} newThread The new thread payload.
 */
export const onThreadUpdate = async (
  bot: ExtendedClient,
  oldThread: ThreadChannel,
  newThread: ThreadChannel
) => {
  try {
    const config = await getConfig(bot, newThread.guild.id);

    if (!config.eventLogChannel) {
      return;
    }

    const channel =
      oldThread.guild.channels.cache.get(config.eventLogChannel) ||
      (await oldThread.guild.channels.fetch(config.eventLogChannel));

    if (!channel || !("send" in channel)) {
      return;
    }

    if (!oldThread.archived && newThread.archived) {
      await channel.send({
        content: `${newThread.name} has been archived <#${newThread.parentId}>`
      });
    }

    if (oldThread.archived && !newThread.archived) {
      await channel.send({
        content: `${newThread.name} has been unarchived <#${newThread.parentId}>`
      });
    }

    if (oldThread.name !== newThread.name) {
      await channel.send({
        content: `${oldThread.name} has been renamed to ${newThread.name} in <#${newThread.parentId}>`
      });
    }
  } catch (err) {
    await errorHandler(bot, "on thread update", err);
  }
};
