import { Message, PartialMessage } from "discord.js";

import { ServerUploadLimits } from "../../config/ServerUploadLimits";
import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { getConfig } from "../../modules/data/getConfig";
import { customSubstring } from "../../utils/customSubstring";
import { errorHandler } from "../../utils/errorHandler";

/**
 * Handles a message delete event.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {Message} message The message that was deleted.
 */
export const onMessageDelete = async (
  bot: ExtendedClient,
  message: Message | PartialMessage
) => {
  try {
    const { author, channel, content, guild, embeds, attachments, stickers } =
      message;

    if (!guild || author?.bot) {
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

    const deletedContent = content || "**No message content found.**";
    const mappedAttachements = attachments
      .map((el) => el)
      .filter((el) => el.size <= ServerUploadLimits[guild.premiumTier]);
    const mappedStickers = stickers
      .map((el) => el)
      .filter((el) => el.available);

    let logContent = `${author?.tag} (${author?.id}) had a message (${message.id}) deleted in <#${channel.id}>:\n\n\`${deletedContent}\``;

    if (message.reference && message.reference.messageId) {
      logContent += `\n\n**This message was in reply to: https://discord.com/channels/${guild.id}/${message.reference.channelId}/${message.reference.messageId}**`;
    }

    if (attachments.size && mappedAttachements.length < attachments.size) {
      logContent += `\n\n**${
        attachments.size - mappedAttachements.length
      } attachment(s) were too large to log.**`;
    }

    await logChannel.send({
      content: customSubstring(logContent, 2000),
      files: mappedAttachements,
      embeds,
      stickers: mappedStickers,
      allowedMentions: {
        parse: []
      }
    });
  } catch (err) {
    await errorHandler(bot, "on message delete", err);
  }
};
