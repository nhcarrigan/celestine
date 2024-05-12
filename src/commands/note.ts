import { GuildMember, SlashCommandBuilder } from "discord.js";

import { Command } from "../interfaces/Command";
import { errorHandler } from "../utils/errorHandler";
import { isModerator } from "../utils/isModerator";
import { processModAction } from "../utils/processModAction";

export const note: Command = {
  data: new SlashCommandBuilder()
    .setName("note")
    .setDescription("Add a note to a member's record.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to add a note to.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for adding this note.")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(400)
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

      if (!isModerator(member as GuildMember)) {
        await interaction.editReply({
          content: "You do not have permission to run this command."
        });
        return;
      }

      const user = interaction.options.getUser("user", true);
      const reason = interaction.options.getString("reason", true);

      const target =
        guild.members.cache.get(user.id) ||
        (await guild.members.fetch(user.id).catch(() => null));

      if (target && isModerator(target)) {
        await interaction.editReply({
          content: "You cannot add a note to a moderator."
        });
        return;
      }

      await processModAction(bot, interaction, guild, user, "note", reason, []);
    } catch (err) {
      const id = await errorHandler(bot, "note command", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
