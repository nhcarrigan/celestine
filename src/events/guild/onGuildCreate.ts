import { Guild } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
/**
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {Guild} guild The newly joined Discord guild.
 */
export const onGuildCreate = async function (
  bot: ExtendedClient,
  guild: Guild
) {
  const owner = await guild.fetchOwner();

  await bot.env.debugHook.send({
    content: `JOINED GUILD: ${guild.name} (${guild.id}) - owned by ${owner?.displayName} (${owner.id})`
  });
  bot.analytics.updateGuilds(bot);
  await bot.analytics.updateEntitlements(bot);
};
