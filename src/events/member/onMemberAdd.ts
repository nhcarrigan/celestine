import { GuildMember } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { getConfig } from "../../modules/data/getConfig";
import { errorHandler } from "../../utils/errorHandler";

/**
 * Sends a log message to the configured log channel when a member
 * joins the server.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {GuildMember} member The user's Discord instance.
 */
export const onMemberAdd = async (bot: ExtendedClient, member: GuildMember) => {
  try {
    const { user, guild } = member;

    const config = await getConfig(bot, guild.id);

    if (!config.eventLogChannel) {
      return;
    }

    const channel =
      guild.channels.cache.get(config.eventLogChannel) ||
      (await guild.channels.fetch(config.eventLogChannel));

    if (!channel || !("send" in channel)) {
      return;
    }

    await channel.send({
      content: `${user.tag} (${user.id}) has joined the server. Total Members: ${guild.memberCount}`
    });
  } catch (err) {
    await errorHandler(bot, "on member add", err);
  }
};
