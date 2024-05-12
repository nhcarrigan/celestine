import { SlashCommandBuilder } from "discord.js";

import { Command } from "../interfaces/Command";
import { generateProfileImage } from "../modules/commands/generateProfileImage";
import { errorHandler } from "../utils/errorHandler";

export const rank: Command = {
  data: new SlashCommandBuilder()
    .setDMPermission(false)
    .setName("rank")
    .setDescription("See your level rank in the community."),
  run: async (bot, interaction) => {
    try {
      await interaction.deferReply();
      const { user } = interaction;

      const target = user.id;

      const record = await bot.db.levels.findUnique({
        where: {
          serverId_userId: {
            userId: target,
            serverId: interaction.guild.id
          }
        }
      });

      if (!record) {
        await interaction.editReply({
          content: "Error loading your database record."
        });
        return;
      }

      const file = await generateProfileImage(bot, record);

      if (!file) {
        await interaction.editReply({
          content: "There was an error generating your profile. :c"
        });
        return;
      }

      await interaction.editReply({ files: [file] });
    } catch (err) {
      const id = await errorHandler(bot, "rank command", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
