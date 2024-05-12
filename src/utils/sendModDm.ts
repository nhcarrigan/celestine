import { Guild, User } from "discord.js";

import { Action, ActionToPastTense } from "../interfaces/Action";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { getConfig } from "../modules/data/getConfig";

import { customSubstring } from "./customSubstring";
import { errorHandler } from "./errorHandler";

/**
 * Sends a moderation notice to a user.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {string} action The action taken on the user.
 * @param {User} user The user to DM.
 * @param {Guild} guild The server the infraction occurred in.
 * @param {string} reason The reason for the action.
 * @returns {boolean} True if the DM was successful, false otherwise.
 */
export const sendModDm = async (
  bot: ExtendedClient,
  action: Action,
  user: User,
  guild: Guild,
  reason: string
): Promise<boolean> => {
  try {
    const config = await getConfig(bot, guild.id);
    let content = `Hello ${user.username}!\n\nYou have been ${
      ActionToPastTense[action]
    } ${["kick", "ban", "softban"].includes(action) ? "from" : "in"} ${
      guild.name
    } for: ${customSubstring(reason, 3000)}`;
    if (action === "ban") {
      content += `\n\nYou can appeal the ban by following this link:\n${config.banAppealLink}`;
    } else if (
      (action === "kick" || action === "softban") &&
      config.inviteLink
    ) {
      content += `\n\nIf you'd like to rejoin our community, you can find an invite link here: ${config.inviteLink}\n\nPlease keep in mind that breaking the rules after rejoining can escalate to a ban.`;
    } else {
      content +=
        "\n\nIf you think this was a mistake or wish to discuss this, please DM our ModMail bot!";
    }

    const success = await user
      .send({
        content
      })
      .then(() => true)
      .catch(() => false);
    return success;
  } catch (err) {
    await errorHandler(bot, "send moderation dm", err);
    return false;
  }
};
