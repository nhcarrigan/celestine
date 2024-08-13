import { GuildMember, PartialGuildMember } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { getConfig } from "../../modules/data/getConfig";
import { errorHandler } from "../../utils/errorHandler";

/**
 * Sends a log message to the configured log channel when a member
 * leaves the server.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {GuildMember} member The user's Discord instance.
 */
export const onMemberRemove = async (
  bot: ExtendedClient,
  member: GuildMember | PartialGuildMember
) => {
  try {
    const { user, guild } = member;

    const config = await getConfig(bot, guild.id);

    await bot.db.birthdays
      .delete({
        where: {
          serverId_userId: { serverId: guild.id, userId: user.id }
        }
      })
      .catch(() => null);
    await bot.db.levels
      .delete({
        where: {
          serverId_userId: { serverId: guild.id, userId: user.id }
        }
      })
      .catch(() => null);

    if (!config.eventLogChannel) {
      return;
    }

    const channel =
      guild.channels.cache.get(config.eventLogChannel) ||
      (await guild.channels.fetch(config.eventLogChannel));

    if (!channel || !("send" in channel)) {
      return;
    }

    const joinStamp = member.joinedTimestamp
      ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
      : "unknown";

    await channel.send({
      content: `${user.tag} (${user.id}) has left the server (joined at ${joinStamp}). Total Members: ${guild.memberCount}`
    });
    bot.analytics.updateUsers(bot);
  } catch (err) {
    await errorHandler(bot, "on member remove", err);
  }
};
