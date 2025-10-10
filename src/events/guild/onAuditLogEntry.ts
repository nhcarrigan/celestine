import { AuditLogEvent, Guild, GuildAuditLogsEntry, User } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { getModActionFromAuditLog } from "../../modules/events/getModActionFromAuditLog";
import { addCase } from "../../utils/addCase";
import { errorHandler } from "../../utils/errorHandler";
import { sendLogMessage } from "../../utils/sendLogMessage";
import { logHandler } from "../../utils/logHandler.js";

/**
 * Handles properly logging a manual mod action based on audit logs.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {GuildAuditLogsEntry} log The audit log payload from Discord.
 * @param {Guild} guild The guild payload from Discord.
 */
export const onAuditLogEntry = async (
  bot: ExtendedClient,
  log: GuildAuditLogsEntry,
  guild: Guild
) => {
  try {
    const { action, changes, executorId, targetId, target, reason } = log;
    if (executorId === bot.user?.id) {
      return;
    }
    // if not a mod action we don't care.
    if (
      ![
        AuditLogEvent.MemberBanAdd,
        AuditLogEvent.MemberBanRemove,
        AuditLogEvent.MemberKick,
        AuditLogEvent.MemberUpdate
      ].includes(action) ||
      (action === AuditLogEvent.MemberUpdate &&
        !changes.find(
          (change) => change.key === "communication_disabled_until"
        )) ||
      !targetId ||
      !(target instanceof User) ||
      !executorId
    ) {
      return;
    }

    const modAction = getModActionFromAuditLog(log);

    if (!modAction) {
      return;
    }

    const reasonString = `This was a manual action pulled from the audit log. Please use the bot for accurate reporting.\n\nReason: ${
      reason || "Unable to parse reason."
    }`;

    const caseNum = await addCase(
      bot,
      guild.id,
      target.id,
      reasonString,
      modAction,
      executorId,
      []
    );
    await sendLogMessage(
      bot,
      guild,
      target,
      modAction,
      reasonString,
      executorId,
      [],
      false,
      caseNum
    );
    await logHandler.metric("audit_log_action", 1, { modAction, guildId: guild.id, targetId: target.id });
  } catch (err) {
    await errorHandler(bot, "on audit log entry", err);
  }
};
