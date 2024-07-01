import { Guild } from "discord.js";

import { ExtendedClient } from "../interfaces/ExtendedClient";

/**
 * Checks if a donation record exists for a specific server. Can be expanded
 * after verification to check for Discord payments directly.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {Guild} guild The guild record from Discord.
 * @returns {boolean} Whether an entitlement record exists for the guild ID in the database.
 */
export const checkEntitledGuild = async (
  bot: ExtendedClient,
  guild: Guild
): Promise<boolean> => {
  const isGuildEntitled = await bot.application?.entitlements
    .fetch({
      guild,
      excludeEnded: true
    })
    .catch(() => null);
  const isManuallyEntitled = await bot.db.entitlements
    .findFirst({ where: { serverId: guild.id } })
    .catch(() => null);
  return Boolean(
    (isGuildEntitled && isGuildEntitled.size) || isManuallyEntitled
  );
};
