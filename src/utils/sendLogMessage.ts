import { Guild, EmbedBuilder, User } from "discord.js";

import { EmbedColours } from "../config/EmbedColours";
import { Action, ActionToPastTense } from "../interfaces/Action";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { getConfig } from "../modules/data/getConfig";

import { customSubstring } from "./customSubstring";
import { errorHandler } from "./errorHandler";

/**
 * Sends a manual moderation log.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {Guild} guild The guild the action was taken in.
 * @param {User} user The user that was actioned.
 * @param {Action} action The action that was taken.
 * @param {string} reason The reason for the action.
 * @param {string} moderatorId The moderator that took the action.
 * @param {string[]} evidence The evidence for the action.
 * @param {boolean} notified Whether the user was notified of the action.
 * @param {number} caseNum The number assigned to the case.
 * @returns {string | null} The URL of the log message, or null if not sent.
 */
export const sendLogMessage = async (
  bot: ExtendedClient,
  guild: Guild,
  user: User,
  action: Action,
  reason: string,
  moderatorId: string,
  evidence: string[],
  notified: boolean,
  caseNum: number
): Promise<{ url: string; embed: EmbedBuilder } | null> => {
  try {
    const config = await getConfig(bot, guild.id);
    if (!config.modLogChannel) {
      return null;
    }

    const channel =
      guild.channels.cache.get(config.modLogChannel) ||
      (await guild.channels.fetch(config.modLogChannel));

    if (!channel || !("send" in channel)) {
      return null;
    }

    const embed = new EmbedBuilder();
    embed.setTitle(`Case ${caseNum}: User ${ActionToPastTense[action]}!`);
    embed.setDescription(customSubstring(reason, 4000));
    embed.addFields(
      {
        name: "Moderator",
        value: `<@!${moderatorId}>`,
        inline: true
      },
      {
        name: "User",
        value: `<@${user.id}>`,
        inline: true
      },
      {
        name: "Evidence",
        value: evidence.length > 0 ? evidence.join(", ") : "None",
        inline: false
      },
      {
        name: "DM sent?",
        value: notified ? "Yes" : "No",
        inline: true
      }
    );
    embed.setColor(EmbedColours[action]);
    embed.setAuthor({
      name: user.tag,
      iconURL: user.displayAvatarURL()
    });
    embed.setFooter({
      text: `User ID: ${user.id}`
    });

    const caseLog = await channel.send({ embeds: [embed] });
    return { url: caseLog.url, embed };
  } catch (err) {
    await errorHandler(bot, "send log message", err);
    return null;
  }
};
