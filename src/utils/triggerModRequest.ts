import { ActionPayload } from "../interfaces/ActionPayload";
import { ExtendedClient } from "../interfaces/ExtendedClient";

import { errorHandler } from "./errorHandler";
import { sendDebugMessage } from "./sendDebugMessage";

/**
 * Processes a moderation request.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {ActionPayload} actionPayload The moderation action data.
 * @returns {boolean} True if the worker reports success, false otherwise.
 */
export const triggerModRequest = async (
  bot: ExtendedClient,
  actionPayload: ActionPayload
): Promise<boolean> => {
  try {
    if (actionPayload.action === "note") {
      return true;
    }
    const guild = await bot.guilds.fetch(actionPayload.serverId);
    if (!guild) {
      await sendDebugMessage(
        bot,
        `Tried to ${actionPayload.action} user ${actionPayload.userId} in guild ${actionPayload.serverId} but:\n\nCould not find guild ${actionPayload.serverId}`
      );
      return false;
    }

    if (actionPayload.action === "unban") {
      if (!(await guild.bans.fetch(actionPayload.userId).catch(() => null))) {
        await sendDebugMessage(
          bot,
          `Could not find ban for user ${actionPayload.userId}`
        );
        return false;
      }
      await guild.bans.remove(
        actionPayload.userId,
        `By ${actionPayload.moderator} : ${actionPayload.reason}`
      );
      return true;
    }

    const member = await guild.members
      .fetch(actionPayload.userId)
      .catch(() => null);

    if (!member && actionPayload.action !== "ban") {
      return false;
    }

    const reason = `By ${actionPayload.moderator} : ${actionPayload.reason}`;

    switch (actionPayload.action) {
      case "softban":
        if (!member) {
          await guild.bans.create(actionPayload.userId, {
            reason,
            deleteMessageSeconds: (actionPayload.pruneDays ?? 1) * 86400
          });
          await guild.bans.remove(actionPayload.userId, "Soft ban.");
          return true;
        }
        await member.ban({
          reason,
          deleteMessageSeconds: (actionPayload.pruneDays ?? 1) * 86400
        });
        await guild.bans.remove(actionPayload.userId, "Soft ban.");
        return true;
      case "ban":
        if (!member) {
          await guild.bans.create(actionPayload.userId, {
            reason,
            deleteMessageSeconds: (actionPayload.pruneDays ?? 1) * 86400
          });
          return true;
        }
        await member.ban({
          reason,
          deleteMessageSeconds: (actionPayload.pruneDays || 0) * 86400
        });
        return true;
      case "kick":
        if (!member) {
          await sendDebugMessage(
            bot,
            `Tried to ${actionPayload.action} user ${actionPayload.userId} in guild ${actionPayload.serverId} but:\n\nCould not find member ${actionPayload.userId}`
          );
          return false;
        }
        await member.kick(reason);
        return true;
      case "mute":
        if (!member) {
          await sendDebugMessage(
            bot,
            `Could not find member ${actionPayload.userId}`
          );
          return false;
        }
        await member.timeout(actionPayload.duration || null, reason);
        return true;
      case "unmute":
        if (!member) {
          await sendDebugMessage(
            bot,
            `Tried to ${actionPayload.action} user ${actionPayload.userId} in guild ${actionPayload.serverId} but:\n\nCould not find member ${actionPayload.userId}`
          );
          return false;
        }
        await member.timeout(null, reason);
        return true;
      default:
        await sendDebugMessage(
          bot,
          `I received a mod action of ${actionPayload.action} but don't know what to do with it!!`
        );
        return false;
    }
  } catch (err) {
    await errorHandler(bot, "handle mod action", err);
    return false;
  }
};
