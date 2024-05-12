import { Action } from "../interfaces/Action";
import { ExtendedClient } from "../interfaces/ExtendedClient";

import { errorHandler } from "./errorHandler";
import { generateTimestamp } from "./generateTimestamp";

/**
 * Adds a case to the user record.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {string} serverId The server id.
 * @param {string} userId The user's id.
 * @param {string} reason The reason for the case.
 * @param {string} action The action taken.
 * @param {string} moderator The ID of the moderator that took the action.
 * @param {string} evidence A link to the evidence.
 * @returns {number} The case number.
 */
export const addCase = async (
  bot: ExtendedClient,
  serverId: string,
  userId: string,
  reason: string,
  action: Action,
  moderator: string,
  evidence: string[]
): Promise<number> => {
  try {
    const existingCases = await bot.db.cases.count({
      where: {
        serverId
      }
    });
    await bot.db.cases.create({
      data: {
        serverId,
        userId,
        number: existingCases + 1,
        reason,
        action,
        moderator,
        evidence,
        timestamp: generateTimestamp(Date.now())
      }
    });
    return existingCases + 1;
  } catch (err) {
    await errorHandler(bot, "add case", err);
    return 0;
  }
};
