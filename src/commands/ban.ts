import {
  GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder
} from "discord.js";

import { Command } from "../interfaces/Command";
import { errorHandler } from "../utils/errorHandler";
import { isModerator } from "../utils/isModerator";
import { processModAction } from "../utils/processModAction";

export const ban: Command = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user from the server.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to ban.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for banning.")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(400)
    )
    .addIntegerOption((option) =>
      option
        .setName("prune")
        .setDescription("Number of days to prune messages.")
        .setMinValue(0)
        .setMaxValue(7)
    )
    .addStringOption((option) =>
      option
        .setName("evidence")
        .setDescription(
          "A link to the evidence for the ban. For multiple links, separate with a space."
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
      const prune = interaction.options.getInteger("prune") || 0;
      const user = interaction.options.getUser("user", true);
      const target =
        guild.members.cache.get(user.id) ||
        (await guild.members.fetch(user.id).catch(() => null));

      if (target && isModerator(target)) {
        await interaction.editReply({
          content: "You cannot ban a moderator."
        });
        return;
      }
      await processModAction(
        bot,
        interaction,
        guild,
        user,
        "ban",
        reason,
        evidence,
        undefined,
        undefined,
        prune
      );
    } catch (err) {
      const id = await errorHandler(bot, "ban command", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
