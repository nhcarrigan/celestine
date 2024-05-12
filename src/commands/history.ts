import {
  GuildMember,
  EmbedBuilder,
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ComponentType,
  ButtonStyle
} from "discord.js";

import { Command } from "../interfaces/Command";
import { errorHandler } from "../utils/errorHandler";
import { getNextIndex, getPreviousIndex } from "../utils/getArrayIndex";
import { isModerator } from "../utils/isModerator";

export const history: Command = {
  data: new SlashCommandBuilder()
    .setName("history")
    .setDescription("View a user's history.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to view the history for.")
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

      const cases = await bot.db.cases.findMany({
        where: {
          userId: target.id,
          serverId: guild.id
        }
      });

      if (!cases.length) {
        await interaction.editReply({
          content: "That user is squeaky clean!"
        });
        return;
      }

      const caseNumbers = cases
        .filter((c) => c.action !== "note")
        .map((c) => `**#${c.number} - ${c.action}**`);
      const noteNumbers = cases
        .filter((c) => c.action === "note")
        .map((c) => `**#${c.number} - ${c.action}**`);
      ``;

      const historyEmbed = new EmbedBuilder();
      historyEmbed.setTitle(`${target.tag}'s history`);
      historyEmbed.addFields(
        {
          name: "Bans",
          value: String(cases.filter((c) => c.action === "ban").length) || "0",
          inline: true
        },
        {
          name: "Unbans",
          value:
            String(cases.filter((c) => c.action === "unban").length) || "0",
          inline: true
        },
        {
          name: "Softbans",
          value:
            String(cases.filter((c) => c.action === "softban").length) || "0",
          inline: true
        },
        {
          name: "Kicks",
          value: String(cases.filter((c) => c.action === "kick").length) || "0",
          inline: true
        },
        {
          name: "Mutes",
          value: String(cases.filter((c) => c.action === "mute").length) || "0",
          inline: true
        },
        {
          name: "Unmutes",
          value:
            String(cases.filter((c) => c.action === "unmute").length) || "0",
          inline: true
        },
        {
          name: "Warns",
          value: String(cases.filter((c) => c.action === "warn").length) || "0",
          inline: true
        },
        {
          name: "Notes",
          value: String(cases.filter((c) => c.action === "note").length) || "0",
          inline: true
        }
      );

      const embeds = [historyEmbed];

      if (caseNumbers.length) {
        const manualEmbed = new EmbedBuilder()
          .setTitle("Manual Cases")
          .setDescription(caseNumbers.join(", "));
        embeds.push(manualEmbed);
      }

      if (noteNumbers.length) {
        const noteEmbed = new EmbedBuilder()
          .setTitle("Notes")
          .setDescription(noteNumbers.join(", "));
        embeds.push(noteEmbed);
      }

      let index = 0;
      const nextButton = new ButtonBuilder()
        .setCustomId("next")
        .setStyle(ButtonStyle.Primary)
        .setLabel(
          embeds[getNextIndex(embeds, index)]?.data.title || "Unknown embed."
        )
        .setEmoji("▶️");
      const prevButton = new ButtonBuilder()
        .setCustomId("prev")
        .setStyle(ButtonStyle.Primary)
        .setLabel(
          embeds[getPreviousIndex(embeds, index)]?.data.title ||
            "Unknown embed."
        )
        .setEmoji("◀️");
      const initialRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        prevButton,
        nextButton
      );

      const response = await interaction.editReply({
        embeds: [embeds[index] as EmbedBuilder],
        components: [initialRow]
      });

      const collector =
        response.createMessageComponentCollector<ComponentType.Button>({
          time: 1000 * 60 * 5
        });

      collector.on("collect", async (i) => {
        await i.deferUpdate();
        index =
          i.customId === "next"
            ? getNextIndex(embeds, index)
            : getPreviousIndex(embeds, index);
        prevButton.setLabel(
          embeds[getPreviousIndex(embeds, index)]?.data.title ||
            "Unknown embed."
        );
        nextButton.setLabel(
          embeds[getNextIndex(embeds, index)]?.data.title || "Unknown embed."
        );
        const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          prevButton,
          nextButton
        );
        await i.editReply({
          embeds: [embeds[index] as EmbedBuilder],
          components: [newRow]
        });
      });

      collector.on("end", async () => {
        await interaction.editReply({
          components: []
        });
      });
    } catch (err) {
      const id = await errorHandler(bot, "history command", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
