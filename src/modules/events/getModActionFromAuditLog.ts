import { AuditLogEvent, GuildAuditLogsEntry } from "discord.js";

import { Action } from "../../interfaces/Action";

/**
 * Module to parse the audit log entry and return the moderation action.
 *
 * @param {GuildAuditLogsEntry} log The audit log entry payload.
 * @returns {Action | null} The mod action string, or null if not found.
 */
export const getModActionFromAuditLog = (
  log: GuildAuditLogsEntry
): Action | null => {
  const muteChange = log.changes.find(
    (change) => change.key === "communication_disabled_until"
  );
  switch (log.action) {
    case AuditLogEvent.MemberBanAdd:
      return "ban";
    case AuditLogEvent.MemberBanRemove:
      return "unban";
    case AuditLogEvent.MemberKick:
      return "kick";
    case AuditLogEvent.MemberUpdate:
      if (!muteChange) {
        return null;
      }
      if (muteChange.new) {
        return "mute";
      }
      return "unmute";
    default:
      return null;
  }
};
