import { CommandInteraction, Guild, User } from "discord.js";

import { Action, ActionToPastTense } from "../interfaces/Action";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { calculateMuteDuration } from "../modules/commands/calculateMuteDuration";

import { addCase } from "./addCase";
import { errorHandler } from "./errorHandler";
import { generateTimestamp } from "./generateTimestamp";
import { sendLogMessage } from "./sendLogMessage";
import { sendModDm } from "./sendModDm";
import { triggerModRequest } from "./triggerModRequest";

/**
 * Module to process a moderation action. Handles DMing, logging, and adding a case.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {CommandInteraction} interaction The interaction payload from Discord.
 * @param {Guild} guild The server the action is taken in.
 * @param {User} user The user being actioned.
 * @param {action} action The action being taken.
 * @param {string} rawReason The reason for the action.
 * @param {string[]} evidence The evidence for the action.
 * @param {number} duration If this is a mute, the duration for the mute.
 * @param {string} durationUnit If this is a mute, the unit for the duration.
 * @param {number} pruneDays If this is a ban, the number of days to delete messages.
 */
export const processModAction = async (
  bot: ExtendedClient,
  interaction: CommandInteraction,
  guild: Guild,
  user: User,
  action: Action,
  rawReason: string,
  evidence: string[],
  duration?: number,
  durationUnit?: string,
  pruneDays?: number
) => {
  try {
    const calculatedDuration = calculateMuteDuration(
      duration || 0,
      durationUnit || "seconds"
    );
    // cap at 28 days
    const finalDuration =
      calculatedDuration <= 2419200000 ? calculatedDuration : 2419200000;
    const reason =
      action === "mute"
        ? `${rawReason}\n\nThis mute expires at ${generateTimestamp(
            Math.round(finalDuration + Date.now())
          )}`
        : rawReason;
    const notified =
      action === "note" || action === "unban"
        ? false
        : await sendModDm(bot, action, user, guild, reason);
    const caseNum = await addCase(
      bot,
      guild.id,
      user.id,
      reason,
      action,
      interaction.user.tag,
      evidence
    );
    await sendLogMessage(
      bot,
      guild,
      user,
      action,
      reason,
      interaction.user.id,
      evidence,
      notified,
      caseNum
    );

    if (!caseNum) {
      await interaction.editReply({
        content:
          "There was a failure in generating a case. Is it possible someone else was actioning this user too? Please try again.",
        components: []
      });
    }

    const success =
      action === "note" || action === "warn"
        ? true
        : await triggerModRequest(bot, {
            userId: user.id,
            serverId: guild.id,
            action,
            reason,
            moderator: interaction.user.id,
            duration: finalDuration,
            pruneDays
          });

    if (!success) {
      await interaction.editReply({
        content: `Failed to ${action} ${user.tag} - please have Naomi check the logs!!!`,
        components: []
      });
      return;
    }

    const confirmation =
      action === "warn" && !notified
        ? `${ActionToPastTense[action]} ${user.tag} for ${reason} - but was not able to DM them.`
        : `${ActionToPastTense[action]} ${user.tag} for ${reason}`;

    await interaction.editReply({
      content: confirmation,
      components: []
    });
  } catch (err) {
    await errorHandler(bot, "process mod action", err);
  }
};
