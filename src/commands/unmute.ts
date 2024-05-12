import {
  GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder
} from "discord.js";

import { Command } from "../interfaces/Command";
import { errorHandler } from "../utils/errorHandler";
import { isModerator } from "../utils/isModerator";
import { processModAction } from "../utils/processModAction";

export const unmute: Command = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Unmute a member")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to unmute.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the unmute.")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(400)
    )
    .addStringOption((option) =>
      option
        .setName("evidence")
        .setDescription(
          "A link to the evidence for the unmute. For multiple links, separate with a space."
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
        !(member as GuildMember).permissions.has(
          PermissionFlagsBits.ModerateMembers
        )
      ) {
        await interaction.editReply({
          content: "You do not have permission to run this command."
        });
        return;
      }

      const user = interaction.options.getUser("user", true);
      const target =
        guild.members.cache.get(user.id) ||
        (await guild.members.fetch(user.id).catch(() => null));

      if (!target) {
        await interaction.editReply({
          content: "That member appears to have left the server."
        });
        return;
      }

      if (!target.isCommunicationDisabled()) {
        await interaction.editReply({
          content: "That member is not muted."
        });
        return;
      }

      if (isModerator(target)) {
        await interaction.editReply({
          content:
            "A moderator should never be muted. How on earth did you achieve this???"
        });
      }

      const reason = interaction.options.getString("reason", true);
      const evidence =
        interaction.options.getString("evidence")?.split(/\s+/) || [];

      await processModAction(
        bot,
        interaction,
        guild,
        user,
        "unmute",
        reason,
        evidence
      );
    } catch (err) {
      const id = await errorHandler(bot, "unmute command", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
