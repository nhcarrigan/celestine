import {
  GuildMember,
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionFlagsBits,
  ButtonStyle,
  ComponentType,
  SlashCommandBuilder
} from "discord.js";

import { Command } from "../interfaces/Command";
import { errorHandler } from "../utils/errorHandler";
import { isModerator } from "../utils/isModerator";
import { processModAction } from "../utils/processModAction";

export const kick: Command = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from the server.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to kick.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reason for kicking.")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(400)
    )
    .addStringOption((option) =>
      option
        .setName("evidence")
        .setDescription(
          "A link to the evidence for the kick. For multiple links, separate with a space."
        )
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

      if (
        !(member as GuildMember).permissions.has(
          PermissionFlagsBits.KickMembers
        )
      ) {
        await interaction.editReply({
          content: "You do not have permission to run this command."
        });
        return;
      }

      const reason = interaction.options.getString("reason", true);
      const evidence =
        interaction.options.getString("evidence")?.split(/\s+/) || [];
      const user = interaction.options.getUser("user", true);
      const target =
        guild.members.cache.get(user.id) ||
        (await guild.members.fetch(user.id).catch(() => null));

      if (!target) {
        await interaction.editReply({
          content: `${user.tag} is not in this server and thus cannot be kicked.`
        });
        return;
      }

      if (isModerator(target)) {
        await interaction.editReply({
          content: "You cannot kick a moderator."
        });
        return;
      }

      const yes = new ButtonBuilder()
        .setCustomId("confirm")
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Success);
      const no = new ButtonBuilder()
        .setCustomId("cancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(yes, no);
      const response = (await interaction.editReply({
        content: `Are you sure you want to kick <@!${user.id}>?`,
        components: [row]
      })) as Message;

      const collector =
        response.createMessageComponentCollector<ComponentType.Button>({
          filter: (click) => click.user.id === interaction.user.id,
          time: 10000,
          max: 1
        });

      collector.on("end", async (clicks) => {
        const choice = clicks.first()?.customId;
        if (!clicks || clicks.size <= 0 || !choice) {
          await interaction.editReply({
            content: "This command has timed out.",
            components: []
          });
          return;
        }

        if (choice === "confirm") {
          await processModAction(
            bot,
            interaction,
            guild,
            user,
            "kick",
            reason,
            evidence
          );
          return;
        }

        if (choice === "cancel") {
          interaction.editReply({
            content: "Kick cancelled.",
            components: []
          });
        }
      });
    } catch (err) {
      const id = await errorHandler(bot, "kick command", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
