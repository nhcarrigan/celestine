import { execSync } from "child_process";

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";

import { Command } from "../interfaces/Command";
import { checkEntitledGuild } from "../utils/checkEntitledGuild";
import { errorHandler } from "../utils/errorHandler";

export const help: Command = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDMPermission(false)
    .setDescription("Get help with the bot."),
  run: async (bot, interaction) => {
    try {
      await interaction.deferReply();

      const version = process.env.npm_package_version;
      const commit = execSync("git rev-parse HEAD").toString().trim();
      const subscribed = await checkEntitledGuild(bot, interaction.guild);

      const servers = bot.guilds.cache.size;
      const members = bot.guilds.cache.reduce(
        (sum, guild) => sum + guild.memberCount,
        0
      );

      const embed = new EmbedBuilder();
      embed.setTitle("Naomi's Moderation Bot");
      embed.setDescription(
        "This is a highly focused moderation bot designed to deliver the best experience when it comes to keeping your community safe and welcoming. To ensure we are able to deliver the features our users require, this bot is only available through a $5/month subscription."
      );
      embed.addFields(
        {
          name: "Version",
          value: version ? `v${version}` : "unable to parse version",
          inline: true
        },
        {
          name: "Current Commit",
          value: `[${commit.slice(
            0,
            7
          )}](https://github.com/nhcarrigan/mod-bot/commit/${commit})`,
          inline: true
        },
        {
          name: "Is this server subscribed?",
          value: subscribed ? "Yes!" : "No :c",
          inline: true
        },
        {
          name: "Details",
          value: `Currently protecting ${servers} servers and watching over ${members} users.`
        }
      );

      const supportButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setURL("https://chat.naomi.lgbt")
        .setLabel("Join our Support Server");
      const subscribeButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setURL("https://docs.nhcarrigan.com/#/donate")
        .setLabel("Subscribe for Access");
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        supportButton,
        subscribeButton
      );

      await interaction.editReply({
        embeds: [embed],
        components: [row]
      });
    } catch (err) {
      const id = await errorHandler(bot, "help command", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
