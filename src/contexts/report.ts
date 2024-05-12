import {
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder
} from "discord.js";

import { EmbedColours } from "../config/EmbedColours";
import { Context } from "../interfaces/Context";
import { getConfig } from "../modules/data/getConfig";
import { errorHandler } from "../utils/errorHandler";

export const report: Context = {
  data: {
    name: "report",
    type: 3
  },
  run: async (bot, interaction) => {
    try {
      if (!interaction.isMessageContextMenuCommand()) {
        await interaction.reply({
          content:
            "This command is improperly configured. Please contact Naomi.",
          ephemeral: true
        });
        return;
      }
      const guild = interaction.guild;
      const message = interaction.options.getMessage(
        "message",
        true
      ) as Message;

      if (!guild || !message) {
        await interaction.reply({
          content: "Could not find the guild record...",
          ephemeral: true
        });
        return;
      }

      const config = await getConfig(bot, guild.id);

      if (!config.messageReportChannel) {
        await interaction.reply({
          content: "Reporting has not been set up for this server.",
          ephemeral: true
        });
        return;
      }

      const channel =
        guild.channels.cache.get(config.messageReportChannel) ||
        (await guild.channels.fetch(config.messageReportChannel));

      if (!channel || !("send" in channel)) {
        await interaction.reply({
          content: "Reporting channel not found.",
          ephemeral: true
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle("Message Reported")
        .setDescription(message.content)
        .setColor(EmbedColours.ban)
        .addFields(
          {
            name: "Author",
            value: `<@${message.author.id}>`,
            inline: true
          },
          {
            name: "Reporter",
            value: `<@${interaction.user.id}>`,
            inline: true
          }
        );

      const link = new ButtonBuilder()
        .setLabel("Message Link")
        .setStyle(ButtonStyle.Link)
        .setURL(message.url);
      const button = new ButtonBuilder()
        .setLabel("Acknowledge")
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`ack-${message.id}`);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
        link,
        button
      ]);

      const reportLog = await channel.send({
        embeds: [embed],
        components: [row]
      });

      const reportModal = new ModalBuilder()
        .setCustomId(`rep-${reportLog.id}`)
        .setTitle("Report Message");
      const reasonInput = new TextInputBuilder()
        .setCustomId("reason")
        .setLabel("Why are you reporting this message?")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);
      const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
        reasonInput
      );
      reportModal.addComponents(actionRow);

      await interaction.showModal(reportModal);
    } catch (err) {
      const id = await errorHandler(bot, "report context command", err);
      await interaction.reply({
        ephemeral: true,
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
