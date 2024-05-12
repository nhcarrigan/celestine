import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

import { Command } from "../interfaces/Command";
import { getConfig } from "../modules/data/getConfig";
import { errorHandler } from "../utils/errorHandler";

export const prune: Command = {
  data: new SlashCommandBuilder()
    .setName("prune")
    .setDescription("Prune messages from THIS channel.")
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of messages to remove")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    ),
  run: async (bot, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const { member, guild } = interaction;
      if (!member || !guild) {
        await interaction.editReply({
          content: "Could not find the member or guild."
        });
        return;
      }

      if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        await interaction.editReply({
          content: "You do not have permission to prune messages."
        });
        return;
      }

      const channel = interaction.channel;
      const amount = interaction.options.getNumber("amount", true);

      if (!channel) {
        await interaction.editReply({
          content: "Please provide a text channel or thread."
        });
        return;
      }
      const messages = await channel.messages.fetch({ limit: amount });
      for (const message of messages.values()) {
        await message.delete().catch(() => null);
      }

      await interaction.editReply({ content: "Complete." });
      const config = await getConfig(bot, interaction.guild.id);
      if (config.modLogChannel) {
        const logChannel =
          interaction.guild.channels.cache.get(config.modLogChannel) ||
          (await interaction.guild.channels.fetch(config.modLogChannel));

        if (logChannel && "send" in logChannel) {
          await logChannel.send({
            content: `Prune run by <@!${interaction.user.id}>. Deleted Messages: ${amount}`
          });
        }
      }
    } catch (err) {
      const id = await errorHandler(bot, "prune interaction", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
