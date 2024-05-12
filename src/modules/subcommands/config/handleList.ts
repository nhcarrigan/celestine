import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder
} from "discord.js";

import { CommandHandler } from "../../../interfaces/CommandHandler";
import { errorHandler } from "../../../utils/errorHandler";
import { getNextIndex, getPreviousIndex } from "../../../utils/getArrayIndex";

/**
 * Fetches the automod settings for the given guild.
 */
export const handleList: CommandHandler = async (bot, interaction, config) => {
  try {
    const embed = new EmbedBuilder();

    embed.setTitle("Automod Settings");
    embed.addFields([
      {
        name: "Moderation Log Channel",
        value: config.modLogChannel ? `<#${config.modLogChannel}>` : "Not set.",
        inline: true
      },
      {
        name: "Event Log Channel",
        value: config.eventLogChannel
          ? `<#${config.eventLogChannel}>`
          : "Not set.",
        inline: true
      },
      {
        name: "Message Report Channel",
        value: config.messageReportChannel
          ? `<#${config.messageReportChannel}>`
          : "Not set.",
        inline: true
      },
      {
        name: "Invite Link",
        value: config.inviteLink || "None",
        inline: true
      },
      {
        name: "Ban Appeal Link",
        value: config.banAppealLink || "None",
        inline: true
      }
    ]);

    const roles = await bot.db.levelRoles.findMany({
      where: { serverId: interaction.guild.id }
    });

    const levelRoles = new EmbedBuilder();
    levelRoles.setTitle("Level Roles");
    levelRoles.setDescription(
      roles
        .map((r) => `- <@&${r.roleId}> is assigned at level ${r.level}`)
        .join("\n") || "No roles are currently set."
    );

    const assignRoles = await bot.db.roles.findMany({
      where: {
        serverId: interaction.guild.id
      }
    });
    const assignRolesEmbed = new EmbedBuilder();
    assignRolesEmbed.setTitle("Self-Assignable Roles");
    assignRolesEmbed.setDescription(
      assignRoles.map((r) => `<@&${r.roleId}>`).join(" ") ||
        "No roles are currently set."
    );
    const embeds = [embed, levelRoles, assignRolesEmbed];

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
        embeds[getPreviousIndex(embeds, index)]?.data.title || "Unknown embed."
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
        embeds[getPreviousIndex(embeds, index)]?.data.title || "Unknown embed."
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
    const id = await errorHandler(bot, "automod list subcommand", err);
    await interaction.editReply({
      content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
    });
  }
};
