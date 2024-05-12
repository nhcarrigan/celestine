import { ModalSubmitInteraction } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { errorHandler } from "../../utils/errorHandler";
import { getConfig } from "../data/getConfig";

/**
 * Handles the submission of the message report form.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {ModalSubmitInteraction} interaction The interaction payload from Discord.
 */
export const handleMessageReportModal = async (
  bot: ExtendedClient,
  interaction: ModalSubmitInteraction
) => {
  try {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.guild) {
      await interaction.editReply({
        content: "This command can only be used in a guild."
      });
      return;
    }
    const reportLogId = interaction.customId.split("-")[1] ?? "oops";
    const config = await getConfig(bot, interaction.guild.id);

    if (!config.messageReportChannel) {
      await interaction.editReply({
        content: "Reporting has not been set up for this server."
      });
      return;
    }

    const channel =
      interaction.guild.channels.cache.get(config.messageReportChannel) ||
      (await interaction.guild.channels.fetch(config.messageReportChannel));

    if (!channel || !("send" in channel)) {
      await interaction.editReply({
        content: "Reporting channel not found."
      });
      return;
    }

    const reportLog = await channel.messages
      .fetch(reportLogId)
      .catch(() => null);
    if (!reportLog) {
      await interaction.editReply({
        content: "Could not find the report log."
      });
      return;
    }

    const embed = reportLog.embeds[0];
    await reportLog.edit({
      embeds: [
        {
          title: embed?.title || "wtf",
          description: embed?.description || "wtf",
          fields: [
            ...(embed?.fields ?? []),
            {
              name: "Reason",
              value: interaction.fields.getTextInputValue("reason")
            }
          ]
        }
      ]
    });

    await interaction.editReply({
      content: "Your report has been submitted."
    });
  } catch (err) {
    const id = await errorHandler(bot, "handle message report modal", err);
    await interaction.editReply({
      content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
    });
  }
};
