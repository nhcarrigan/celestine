import { Message } from "discord.js";

import levelScale from "../../config/LevelScale";
import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { calculateMuteDuration } from "../../modules/commands/calculateMuteDuration";
import { checkSpamDomain } from "../../modules/events/checkSpamDomain";
import { addCase } from "../../utils/addCase";
import { errorHandler } from "../../utils/errorHandler";
import { sendLogMessage } from "../../utils/sendLogMessage";
import { sendModDm } from "../../utils/sendModDm";
import { triggerModRequest } from "../../utils/triggerModRequest";

const linkRegex = /https?:\/\/([a-zA-Z0-9_.-]{2,256}\.\w{2,24}\b)/g;

/**
 * Module to handle the messageCreate event from Discord.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {Message} message The message payload from Discord.
 */
export const onMessage = async (bot: ExtendedClient, message: Message) => {
  try {
    const { guild, member, author, system } = message;
    if (!guild || !member || system || author.bot) {
      return;
    }

    const links = message.content.match(linkRegex);

    if (links) {
      for (const link of links) {
        if (await checkSpamDomain(bot, link.replace(/https?:\/\//, ""))) {
          await message.delete().catch(() => null);
          const notified = await sendModDm(
            bot,
            "mute",
            author,
            guild,
            "Your account appears to be compromised."
          );
          const caseNum = await addCase(
            bot,
            guild.id,
            author.id,
            "Your account appears to be compromised",
            "mute",
            "Automoderator",
            [link]
          );
          await sendLogMessage(
            bot,
            guild,
            author,
            "mute",
            "Your account appears to be compromised",
            "Automoderation",
            [link],
            notified,
            caseNum
          );
          await triggerModRequest(bot, {
            userId: author.id,
            serverId: guild.id,
            action: "mute",
            reason: "Your account appears to be compromised",
            moderator: "Automoderator",
            duration: calculateMuteDuration(24, "hours"),
            pruneDays: 0
          });
          return;
        }
      }
    }

    const bonus = Math.floor(message.content.length / 10);
    const pointsEarned = Math.floor(Math.random() * (20 + bonus)) + 5;
    const user = await bot.db.levels.upsert({
      where: {
        serverId_userId: {
          serverId: guild.id,
          userId: author.id
        }
      },
      update: {},
      create: {
        serverId: guild.id,
        userId: author.id,
        username: author.username,
        avatar: author.displayAvatarURL(),
        points: 0,
        level: 0
      }
    });

    if (Date.now() - user.cooldown.getTime() < 60000 || user.level >= 1000) {
      return;
    }
    user.points += pointsEarned;
    user.cooldown = new Date();
    let levelUp = false;

    while (user.points > (levelScale[user.level + 1] ?? Infinity)) {
      user.level++;
      levelUp = true;
    }

    await bot.db.levels.update({
      where: {
        serverId_userId: {
          serverId: guild.id,
          userId: author.id
        }
      },
      data: {
        points: user.points,
        level: user.level,
        username: author.username,
        avatar: author.displayAvatarURL(),
        cooldown: user.cooldown
      }
    });

    if (levelUp) {
      await message.reply(`Congrats! You're now level ${user.level}!!`);
    }

    const levelRoles = await bot.db.levelRoles.findMany({
      where: {
        serverId: guild.id,
        level: {
          lte: user.level
        }
      }
    });
    for (const record of levelRoles) {
      await member.roles.add(record.roleId).catch(() => null);
    }
  } catch (err) {
    await errorHandler(bot, "on message", err);
  }
};
