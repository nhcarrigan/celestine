import { ExtendedClient } from "../interfaces/ExtendedClient";
import { checkEntitledGuild } from "../utils/checkEntitledGuild";
import { errorHandler } from "../utils/errorHandler";

/**
 * Loops through the list of configured servers to lock security for, and processes the
 * API calls.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 */
export const maintainSecurity = async (bot: ExtendedClient) => {
  try {
    const records = await bot.db.security.findMany();
    const date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    for (const record of records) {
      const guild =
        bot.guilds.cache.get(record.serverId) ||
        (await bot.guilds.fetch(record.serverId).catch(() => null));
      if (!guild) {
        continue;
      }
      const isEntitled = await checkEntitledGuild(bot, guild);
      if (!isEntitled) {
        continue;
      }
      await fetch(
        `https://discord.com/api/v10/guilds/${record.serverId}/incident-actions`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bot ${bot.env.token}`,
            "content-type": "application/json"
          },
          body: JSON.stringify({
            dms_disabled_until: record.lockDms ? date : null,
            invites_disabled_until: record.lockInvites ? date : null
          })
        }
      ).catch(
        async (e) =>
          await errorHandler(bot, `incident-actions for ${record.serverId}`, e)
      );
    }
  } catch (err) {
    await errorHandler(bot, "maintain security", err);
  }
};
