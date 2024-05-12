import { ButtonInteraction } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { errorHandler } from "../../utils/errorHandler";

/**
 * Handles the logic for the acknowledge button on message reports.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {ButtonInteraction} interaction The interaction payload from Discord.
 */
export const handleReportAcknowledgeButton = async (
  bot: ExtendedClient,
  interaction: ButtonInteraction
) => {
  try {
    await interaction.deferUpdate();
    const message = interaction.message;
    const embed = message.embeds[0];
    await interaction.editReply({
      embeds: [
        {
          title: embed?.title || "wtf",
          description: embed?.description || "wtf",
          fields: [
            ...(embed?.fields ?? []),
            {
              name: "Acknowledged by",
              value: `<@${interaction.user.id}>`
            }
          ],
          color: 0x00ff00
        }
      ],
      components: []
    });
  } catch (err) {
    const id = await errorHandler(bot, "handle report acknowledge button", err);
    await interaction.editReply({
      content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
    });
  }
};
