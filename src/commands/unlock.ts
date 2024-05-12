import {
  ChannelType,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextChannel
} from "discord.js";

import { Command } from "../interfaces/Command";
import { getConfig } from "../modules/data/getConfig";
import { errorHandler } from "../utils/errorHandler";

export const unlock: Command = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Remove lock down from a channel.")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to unlock.")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    ),
  run: async (bot, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const { member, guild } = interaction;

      if (!member || !guild) {
        await interaction.editReply({
          content: "You must be in a guild to use this command."
        });
        return;
      }

      if (
        !(member as GuildMember).permissions.has(
          PermissionFlagsBits.ManageChannels
        )
      ) {
        await interaction.editReply({
          content: "You do not have permission to run this command."
        });
        return;
      }

      const channel = interaction.options.getChannel(
        "channel",
        true
      ) as TextChannel;

      if (!("send" in channel)) {
        await interaction.editReply({
          content: "You must use this command to target a text based channel."
        });
        return;
      }

      await channel.permissionOverwrites.edit(
        guild.id,
        {
          SendMessages: null
        },
        { reason: `Lockdown Removed by ${interaction.user.tag}` }
      );

      const config = await getConfig(bot, guild.id);
      if (!config.modLogChannel) {
        return;
      }
      const logChannel =
        guild.channels.cache.get(config.modLogChannel) ||
        (await guild.channels.fetch(config.modLogChannel));

      if (!logChannel || !("send" in logChannel)) {
        return;
      }
      const embed = new EmbedBuilder();
      embed.setTitle("Channel Unlocked");
      embed.setDescription(`The <#${channel.id}> channel has been unlocked.`);
      embed.setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.displayAvatarURL()
      });
      await logChannel.send({ embeds: [embed] });

      await interaction.editReply({ content: "Channel has been unlocked!" });
    } catch (err) {
      const id = await errorHandler(bot, "unlock command", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
