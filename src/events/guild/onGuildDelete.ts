import { Guild } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
/**
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {Guild} guild The newly left Discord guild.
 */
export const onGuildDelete = async function (
  bot: ExtendedClient,
  guild: Guild
) {
  await bot.env.debugHook.send({
    content: `LEFT GUILD: ${guild.name} (${guild.id}) `
  });
};
