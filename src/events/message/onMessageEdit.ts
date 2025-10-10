import { Message, PartialMessage } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { getConfig } from "../../modules/data/getConfig";
import { customSubstring } from "../../utils/customSubstring";
import { errorHandler } from "../../utils/errorHandler";
import { generateDiff } from "../../modules/events/generateDiff";
import { logHandler } from "../../utils/logHandler.js";

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

      const diffContent
      = (oldMessage.content ?? newMessage.content) === null
        ? "This message appears to have no content."
        : generateDiff(oldMessage.content ?? "", newMessage.content ?? "");

    await logChannel.send({
      content: `${author?.tag} (${author?.id}) edited their message in in <#${
        channel.id
      }>:\`\`\`diff\n${customSubstring(diffContent, 4000)}\n\`\`\``,
      allowedMentions: { parse: [] }
    });
    await logHandler.metric("message_edit", 1, { userId: author?.id ?? "unknown", guildId: guild.id });
  } catch (err) {
    await errorHandler(bot, "on message edit", err);
  }
};
