import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  Guild,
  GuildMember,
  PermissionFlagsBits
} from "discord.js";

import { logChannelChoices } from "../config/LogChannelChoices";
import { Command } from "../interfaces/Command";
import { CommandHandler } from "../interfaces/CommandHandler";
import { getConfig } from "../modules/data/getConfig";
import { handleAppealLink } from "../modules/subcommands/config/handleAppealLink";
import { handleBirthdayChannel } from "../modules/subcommands/config/handleBirthdayChannel";
import { handleInviteLink } from "../modules/subcommands/config/handleInviteLink";
import { handleJoinRole } from "../modules/subcommands/config/handleJoinRole";
import { handleList } from "../modules/subcommands/config/handleList";
import { handleLogging } from "../modules/subcommands/config/handleLogging";
import { handleRole } from "../modules/subcommands/config/handleRole";
import { errorHandler } from "../utils/errorHandler";

const handlers: { [key: string]: CommandHandler } = {
  list: handleList,
  "invite-link": handleInviteLink,
  "appeal-link": handleAppealLink,
  logging: handleLogging,
  role: handleRole,
  "join-role": handleJoinRole,
  "birthday-channel": handleBirthdayChannel
};

export const config: Command = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Modify the config settings.")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("list")
        .setDescription("List your server's current config settings")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("invite-link")
        .setDescription(
          "Set the link to be sent to someone to rejoin the server after they are kicked."
        )
        .addStringOption((option) =>
          option
            .setRequired(true)
            .setName("link")
            .setDescription("The invite link to send.")
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("appeal-link")
        .setDescription(
          "Set the link to be sent to someone when they are banned to appeal the decision."
        )
        .addStringOption((option) =>
          option
            .setRequired(true)
            .setName("link")
            .setDescription("The appeal link to send.")
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("logging")
        .setDescription("Configure a logging channel.")
        .addStringOption((option) =>
          option
            .setName("log-type")
            .setDescription("The type of log to configure.")
            .addChoices(...logChannelChoices)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to log to.")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("roles")
        .setDescription("Toggle roles to be self-assignable by users.")
        .addRoleOption((o) =>
          o
            .setName("role")
            .setDescription("The role to toggle.")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("join-role")
        .setDescription("Configure a role to be assigned when a member joins.")
        .addRoleOption((o) =>
          o
            .setName("role")
            .setDescription("The role to assign.")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("birthday-channel")
        .setDescription(
          "Configure a channel where members can be wished a happy birthday."
        )
        .addChannelOption((o) =>
          o
            .setName("channel")
            .setDescription("The channel to send birthday messages in.")
            .setRequired(true)
        )
    ),
  run: async (bot, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });

      const member = interaction.member as GuildMember;
      const guild = interaction.guild as Guild;

      if (!member || !guild) {
        await interaction.editReply({
          content: "You must be in a server to use this command."
        });
        return;
      }

      const config = await getConfig(bot, guild.id);

      if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        await interaction.editReply({
          content: "You do not have permission to use this command."
        });
        return;
      }

      const subcommand = interaction.options.getSubcommand();

      const handler = handlers[subcommand];

      if (handler) {
        await handler(bot, interaction, config);
        return;
      }
      await interaction.editReply({
        content: "This is an invalid subcommand. Please contact Naomi."
      });
    } catch (err) {
      const id = await errorHandler(bot, "config command", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
