import { Message, PartialMessage } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { getConfig } from "../../modules/data/getConfig";
import { customSubstring } from "../../utils/customSubstring";
import { errorHandler } from "../../utils/errorHandler";

/**
 * Handles a message edit event.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {Message} oldMessage The old message payload.
 * @param {Message} newMessage The new message payload.
 */
export const onMessageEdit = async (
  bot: ExtendedClient,
  oldMessage: Message | PartialMessage,
  newMessage: Message | PartialMessage
) => {
  try {
    const { author, channel, guild } = newMessage;

    if (!guild || author?.bot) {
      return;
    }

    if (
      !oldMessage.content ||
      !newMessage.content ||
      oldMessage.content === newMessage.content
    ) {
      return;
    }

    const config = await getConfig(bot, guild.id);

    if (!config.eventLogChannel) {
      return;
    }

    const logChannel =
      guild.channels.cache.get(config.eventLogChannel) ||
      (await guild.channels.fetch(config.eventLogChannel));

    if (!logChannel || !("send" in logChannel)) {
      return;
    }

    await logChannel.send({
      content: `${author?.tag} (${author?.id}) edited their message in in <#${
        channel.id
      }>:\n\n**Old Content:**\n\`${customSubstring(
        oldMessage.content,
        1750
      )}\`\n\n**New content:**\n\`${customSubstring(
        newMessage.content,
        1750
      )}\`\n\n${newMessage.url}`,
      allowedMentions: { parse: [] }
    });
  } catch (err) {
    await errorHandler(bot, "on message edit", err);
  }
};
