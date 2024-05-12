import { GuildMember, EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { Command } from "../interfaces/Command";
import { customSubstring } from "../utils/customSubstring";
import { errorHandler } from "../utils/errorHandler";
import { isModerator } from "../utils/isModerator";

export const cases: Command = {
  data: new SlashCommandBuilder()
    .setName("case")
    .setDescription("View a specific moderation case.")
    .addIntegerOption((option) =>
      option
        .setName("number")
        .setDescription("The case number to view.")
        .setRequired(true)
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

      const target = interaction.options.getUser("user", true);
      const number = interaction.options.getInteger("number", true);

      const requestedCase = await bot.db.cases.findFirst({
        where: {
          userId: target.id,
          serverId: guild.id,
          number
        }
      });

      if (!requestedCase) {
        await interaction.editReply({
          content: "That user doesn't seem to have a moderation history yet."
        });
        return;
      }

      const viewEmbed = new EmbedBuilder();
      viewEmbed.setTitle(
        `Case ${requestedCase.number} - ${requestedCase.action}`
      );
      viewEmbed.setAuthor({
        name: target.tag,
        iconURL: target.displayAvatarURL()
      });
      viewEmbed.setDescription(customSubstring(requestedCase.reason, 4000));
      viewEmbed.addFields(
        {
          name: "Evidence",
          value:
            customSubstring(requestedCase.evidence.join("\n"), 2000) ||
            "No evidence provided"
        },
        {
          name: "Date",
          value: requestedCase.timestamp
        },
        {
          name: "Moderator",
          value: requestedCase.moderator
        }
      );

      await interaction.editReply({
        embeds: [viewEmbed]
      });
    } catch (err) {
      const id = await errorHandler(bot, "cases command", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
