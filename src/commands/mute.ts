import {
  GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder
} from "discord.js";

import { Command } from "../interfaces/Command";
import { errorHandler } from "../utils/errorHandler";
import { isModerator } from "../utils/isModerator";
import { processModAction } from "../utils/processModAction";

export const mute: Command = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute a member")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to mute.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("The duration of the mute.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duration-unit")
        .setDescription("The unit for the duration value")
        .setRequired(true)
        .addChoices(
          { name: "Minutes", value: "minutes" },
          { name: "Hours", value: "hours" },
          { name: "Days", value: "days" },
          { name: "Weeks", value: "weeks" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for the mute.")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(400)
    )
    .addStringOption((option) =>
      option
        .setName("evidence")
        .setDescription(
          "A link to the evidence for the mute. For multiple links, separate with a space."
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

      if (isModerator(target)) {
        await interaction.editReply({
          content: "You cannot mute a moderator."
        });
        return;
      }

      const duration = interaction.options.getInteger("duration", true);
      const durationUnit = interaction.options.getString("duration-unit", true);

      const reason = interaction.options.getString("reason", true);
      const evidence =
        interaction.options.getString("evidence")?.split(/\s+/) || [];

      await processModAction(
        bot,
        interaction,
        guild,
        user,
        "mute",
        reason,
        evidence,
        duration,
        durationUnit
      );
    } catch (err) {
      const id = await errorHandler(bot, "mute command", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
