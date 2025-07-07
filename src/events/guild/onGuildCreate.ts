import { Guild } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { logHandler } from "../../utils/logHandler";
/**
 *
 * @param {ExtendedClient} _bot The bot's Discord instance.
 * @param {Guild} guild The newly joined Discord guild.
 */
export const onGuildCreate = async function (
  _bot: ExtendedClient,
  guild: Guild
) {
  const owner = await guild.fetchOwner();

  await logHandler.log(
    "info",
    `Joined guild: ${guild.name} (${guild.id}) - owned by ${owner?.displayName} (${owner.id})`
  );
};
