import { Guild } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { errorHandler } from "../../utils/errorHandler";
/**
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {Guild} guild The newly left Discord guild.
 */
export const onGuildDelete = async function (
  bot: ExtendedClient,
  guild: Guild
) {
  try {
    await bot.env.debugHook.send({
      content: `LEFT GUILD: ${guild.name} (${guild.id}) `
    });
    await bot.db.cases
      .deleteMany({ where: { serverId: guild.id } })
      .catch(() => null);
    await bot.db.levelRoles
      .deleteMany({ where: { serverId: guild.id } })
      .catch(() => null);
    await bot.db.levels
      .deleteMany({ where: { serverId: guild.id } })
      .catch(() => null);
    await bot.db.configs
      .deleteMany({ where: { serverId: guild.id } })
      .catch(() => null);
    await bot.db.roles
      .deleteMany({ where: { serverId: guild.id } })
      .catch(() => null);
    await bot.db.birthdays
      .deleteMany({ where: { serverId: guild.id } })
      .catch(() => null);
    await bot.db.security
      .deleteMany({ where: { serverId: guild.id } })
      .catch(() => null);
    bot.analytics.updateGuilds(bot);
  } catch (err) {
    await errorHandler(bot, "on guild delete", err);
  }
};
