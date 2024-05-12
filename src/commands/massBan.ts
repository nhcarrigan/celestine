import {
  ActionRowBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle
} from "discord.js";

import { Command } from "../interfaces/Command";
import { errorHandler } from "../utils/errorHandler";

export const massBan: Command = {
  data: new SlashCommandBuilder()
    .setName("massban")
    .setDescription("Ban a list of user IDs at once."),
  run: async (bot, interaction) => {
    try {
      const textInput = new TextInputBuilder()
        .setCustomId("mass-ban-ids")
        .setLabel("Input your list of IDs separated by new lines")
        .setMaxLength(4000)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);
      const reasonInput = new TextInputBuilder()
        .setCustomId("reason")
        .setLabel("Reason for the mass ban?")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      const inputRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
        textInput
      );
      const reasonRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
        reasonInput
      );
      const modal = new ModalBuilder()
        .setCustomId("mass-ban-modal")
        .setTitle("Mass Ban")
        .addComponents(inputRow, reasonRow);

      await interaction.showModal(modal);
    } catch (err) {
      const id = await errorHandler(bot, "mass ban", err);
      await interaction.reply({
        ephemeral: true,
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
