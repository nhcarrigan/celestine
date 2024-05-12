import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import { Command } from "../interfaces/Command";
import { errorHandler } from "../utils/errorHandler";

export const ping: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check the response time of the bot."),
  run: async (bot, interaction) => {
    try {
      await interaction.deferReply();
      const receivedInteraction = Date.now();
      const { createdTimestamp } = interaction;

      const discordLatency = receivedInteraction - createdTimestamp;
      const websocketLatency = bot.ws.ping;

      await bot.db.$runCommandRaw({ ping: 1 });
      const databaseLatency = Date.now() - receivedInteraction;

      const pingEmbed = new EmbedBuilder();
      pingEmbed.setTitle("Pong!");
      pingEmbed.setDescription("Here is my latency information!");
      pingEmbed.addFields(
        {
          name: "Interaction Latency",
          value: `${discordLatency}ms`,
          inline: true
        },
        {
          name: "Websocket Latency",
          value: `${websocketLatency}ms`,
          inline: true
        },
        {
          name: "Database Latency",
          value: `${databaseLatency}ms`,
          inline: true
        }
      );
      await interaction.editReply({ embeds: [pingEmbed] });
    } catch (err) {
      const id = await errorHandler(bot, "ping command", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
