import { GuildMember, PartialGuildMember } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { getConfig } from "../../modules/data/getConfig";
import { errorHandler } from "../../utils/errorHandler";
import { logHandler } from "../../utils/logHandler.js";

/**
 * Sends a log message to the configured log channel when a member's
 * data is updated.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {GuildMember} oldMember The user's old Discord instance.
 * @param {GuildMember} newMember The user's new Discord instance.
 */
export const onMemberUpdate = async (
  bot: ExtendedClient,
  oldMember: GuildMember | PartialGuildMember,
  newMember: GuildMember
) => {
  try {
    const { user, guild } = newMember;

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

    if (oldMember.user.tag !== newMember.user.tag) {
      await channel.send({
        content: `${user.tag} (${user.id}) has changed their name from ${oldMember.user.tag} to ${newMember.user.tag}`
      });
    }

    if (oldMember.nickname !== newMember.nickname) {
      await channel.send({
        content: `${user.tag} (${user.id}) has changed their nickname from ${
          oldMember.nickname || "**none**"
        } to ${newMember.nickname || "**none**"}`
      });
    }

    const removedRoles = oldMember.roles.cache.filter(
      (role) => !newMember.roles.cache.has(role.id)
    );
    const addedRoles = newMember.roles.cache.filter(
      (role) => !oldMember.roles.cache.has(role.id)
    );

    if (removedRoles.size > 0) {
      await channel.send({
        content: `${user.tag} (${
          user.id
        }) has removed the following roles: ${removedRoles.map(
          (role) => role.name
        )}`
      });
    }

    if (addedRoles.size > 0) {
      await channel.send({
        content: `${user.tag} (${
          user.id
        }) has added the following roles: ${addedRoles.map(
          (role) => role.name
        )}`
      });
    }
    await logHandler.metric("member_update", 1, { userId: user.id, guildId: guild.id });
  } catch (err) {
    await errorHandler(bot, "on member update", err);
  }
};
