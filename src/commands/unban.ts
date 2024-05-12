import {
  GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder
} from "discord.js";

import { Command } from "../interfaces/Command";
import { errorHandler } from "../utils/errorHandler";
import { processModAction } from "../utils/processModAction";

export const unban: Command = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a user from the server.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to unban.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for unbanning.")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(400)
    )
    .addStringOption((option) =>
      option
        .setName("evidence")
        .setDescription(
          "A link to the evidence for the unban. For multiple links, separate with a space."
        )
    ),
  run: async (bot, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const { member, guild } = interaction;

      if (!member || !guild) {
        await interaction.editReply({
          content: "There was an error loading the guild and member data."
        });
        return;
      }

      if (
        !(member as GuildMember).permissions.has(PermissionFlagsBits.BanMembers)
      ) {
        await interaction.editReply({
          content: "You do not have permission to run this command."
        });
        return;
      }

      const reason = interaction.options.getString("reason", true);
      const evidence =
        interaction.options.getString("evidence")?.split(/\s+/) || [];
      const user = interaction.options.getUser("user", true);

      const isBanned = await guild.bans.fetch(user.id).catch(() => false);

      if (!isBanned) {
        await interaction.editReply({
          content: `ID ${user.id} is not banned.`
        });
        return;
      }

      await processModAction(
        bot,
        interaction,
        guild,
        user,
        "unban",
        reason,
        evidence
      );
    } catch (err) {
      const id = await errorHandler(bot, "unban command", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
