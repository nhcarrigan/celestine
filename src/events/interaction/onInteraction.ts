import { Interaction } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { handleCopyIdButton } from "../../modules/buttons/handleCopyIdButton";
import { handleReportAcknowledgeButton } from "../../modules/buttons/handleReportAcknowledgeButton";
import { handleChatInputCommand } from "../../modules/interactions/handleChatInputCommand";
import { handleContextMenuCommand } from "../../modules/interactions/handleContextMenuCommand";
import { handleMassBanModal } from "../../modules/modals/handleMassBanModal";
import { handleMessageReportModal } from "../../modules/modals/handleMessageReportModal";
import { checkEntitledGuild } from "../../utils/checkEntitledGuild";
import { errorHandler } from "../../utils/errorHandler";
import { logHandler } from "../../utils/logHandler.js";

/**
 * Handles interactions.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {Interaction} interaction The interaction payload from Discord.
 */
export const onInteraction = async (
  bot: ExtendedClient,
  interaction: Interaction
) => {
  try {
    if (interaction.isAutocomplete()) {
      return;
    }
    if (
      !interaction.guild ||
      (!(await checkEntitledGuild(bot, interaction.guild)) &&
        (!interaction.isChatInputCommand() ||
          interaction.commandName !== "help"))
    ) {
      await interaction.reply(
        "Your guild does not appear to be subscribed to use our bot. Please reach out to us in our [support server](<https://chat.naomi.lgbt>) if you would like to sign up."
      );
      return;
    }
    if (interaction.isChatInputCommand()) {
      handleChatInputCommand(bot, interaction);
    }

    if (interaction.isContextMenuCommand()) {
      handleContextMenuCommand(bot, interaction);
    }

    if (interaction.isButton()) {
      if (interaction.customId.startsWith("ack")) {
        await handleReportAcknowledgeButton(bot, interaction);
      }
      if (interaction.customId.startsWith("copyid")) {
        await handleCopyIdButton(bot, interaction);
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === "mass-ban-modal") {
        await handleMassBanModal(bot, interaction);
      }
      if (interaction.customId.startsWith("rep")) {
        await handleMessageReportModal(bot, interaction);
      }
    }
    await logHandler.metric("interaction_create", 1, { userId: interaction.user.id, guildId: interaction.guild.id, command: interaction.isCommand() ? interaction.commandName : interaction.customId });
  } catch (err) {
    const id = await errorHandler(bot, "on interaction", err);
    if (!interaction.isAutocomplete()) {
      await interaction.reply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
