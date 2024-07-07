import { ExtendedClient } from "../interfaces/ExtendedClient";
import { errorHandler } from "../utils/errorHandler";

/**
 * Fetches the configs from the database, then for each config that
 * has a birthday channel set, fetch birthdays. If any are from today,
 * post!
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 */
export const postBirthdays = async (bot: ExtendedClient) => {
  try {
    const configs = await bot.db.configs.findMany();
    const withChannel = configs.filter((c) => c.birthdayChannel);
    for (const record of withChannel) {
      const guild = bot.guilds.cache.get(record.serverId);
      if (!guild) {
        continue;
      }
      const channel = guild.channels.cache.get(record.birthdayChannel);
      if (!channel || !("send" in channel)) {
        continue;
      }

      const hasBirthdaySet = await bot.db.birthdays.findMany({
        where: { serverId: guild.id }
      });
      const today = new Date();
      const todayIn2000 = new Date(
        `2000-${today.getMonth() + 1}-${today.getDate()}`
      );
      const isBirthdayToday = hasBirthdaySet.filter(
        (r) => r.birthday === todayIn2000
      );
      const names = isBirthdayToday.map((r) => `<@${r.userId}>`).join(", ");
      await channel.send(`Happy birthday to these lovely people~!\n${names}`);
    }
  } catch (err) {
    await errorHandler(bot, "post birthdays", err);
  }
};
