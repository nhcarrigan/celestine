import { ButtonInteraction } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { errorHandler } from "../../utils/errorHandler";

/**
 * Handles the logic for the acknowledge button on message reports.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {ButtonInteraction} interaction The interaction payload from Discord.
 */
export const handleCopyIdButton = async (
  bot: ExtendedClient,
  interaction: ButtonInteraction
) => {
  try {
    await interaction.deferReply({ ephemeral: true });
    const id = interaction.customId.split("-")[1];
    await interaction.editReply({
      content: id || "Unable to parse ID."
    });
  } catch (err) {
    const id = await errorHandler(bot, "handle copy id button", err);
    await interaction.editReply({
      content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
    });
  }
};
