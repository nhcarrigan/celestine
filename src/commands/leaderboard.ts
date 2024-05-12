import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  SlashCommandBuilder
} from "discord.js";

import { Command } from "../interfaces/Command";
import { generateLeaderboardImage } from "../modules/commands/generateProfileImage";
import { errorHandler } from "../utils/errorHandler";

export const leaderboard: Command = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("See the levels for this community.")
    .setDMPermission(false),
  run: async (bot, interaction) => {
    try {
      await interaction.deferReply();

      const levels = await bot.db.levels.findMany({
        where: {
          serverId: interaction.guild.id
        },
        orderBy: {
          points: "desc"
        }
      });

      const mapped = levels.map((user, index) => ({
        ...user,
        index: index + 1
      }));

      let page = 1;
      const lastPage = Math.ceil(mapped.length / 10);

      const pageBack = new ButtonBuilder()
        .setCustomId("prev")
        .setDisabled(true)
        .setLabel("◀")
        .setStyle(ButtonStyle.Primary);
      const pageForward = new ButtonBuilder()
        .setCustomId("next")
        .setLabel("▶")
        .setStyle(ButtonStyle.Primary);

      if (page <= 1) {
        pageBack.setDisabled(true);
      } else {
        pageBack.setDisabled(false);
      }

      if (page >= lastPage) {
        pageForward.setDisabled(true);
      } else {
        pageForward.setDisabled(false);
      }

      const attachment = await generateLeaderboardImage(
        bot,
        mapped.slice(page * 10 - 10, page * 10)
      );

      if (!attachment) {
        await interaction.editReply({
          content: "Failed to load leaderboard image.",
          files: [],
          components: []
        });
        return;
      }

      const sent = await interaction.editReply({
        files: [attachment],
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            pageBack,
            pageForward
          )
        ]
      });

      const clickyClick =
        sent.createMessageComponentCollector<ComponentType.Button>({
          time: 300000,
          filter: (click) => click.user.id === interaction.user.id
        });

      clickyClick.on("collect", async (click) => {
        await click.deferUpdate();
        if (click.customId === "prev") {
          page--;
        }
        if (click.customId === "next") {
          page++;
        }

        if (page <= 1) {
          pageBack.setDisabled(true);
        } else {
          pageBack.setDisabled(false);
        }

        if (page >= lastPage) {
          pageForward.setDisabled(true);
        } else {
          pageForward.setDisabled(false);
        }

        const attachment = await generateLeaderboardImage(
          bot,
          mapped.slice(page * 10 - 10, page * 10)
        );

        if (!attachment) {
          await interaction.editReply({
            content: "Failed to load leaderboard image.",
            files: [],
            components: []
          });
          return;
        }

        await interaction.editReply({
          files: [attachment],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              pageBack,
              pageForward
            )
          ]
        });
      });

      clickyClick.on("end", async () => {
        pageBack.setDisabled(true);
        pageForward.setDisabled(true);
        await interaction.editReply({
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              pageBack,
              pageForward
            )
          ]
        });
      });
    } catch (err) {
      const id = await errorHandler(bot, "leaderboard subcommand", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
