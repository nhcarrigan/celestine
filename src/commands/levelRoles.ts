import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder
} from "discord.js";

import { Command } from "../interfaces/Command";
import { errorHandler } from "../utils/errorHandler";

export const levelRoles: Command = {
  data: new SlashCommandBuilder()
    .setName("level-role")
    .setDescription("Manage level roles.")
    .setDMPermission(false)
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("create")
        .setDescription("Create a new level role.")
        .addRoleOption((o) =>
          o
            .setName("role")
            .setDescription("The role to assign")
            .setRequired(true)
        )
        .addIntegerOption((o) =>
          o
            .setName("level")
            .setDescription("The level at which to assign the role.")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(1000)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("delete")
        .setDescription("Delete a level role.")
        .addRoleOption((o) =>
          o
            .setName("role")
            .setDescription("The role to remove")
            .setRequired(true)
        )
        .addIntegerOption((o) =>
          o
            .setName("level")
            .setDescription("The level at which the role was being assigned")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(1000)
        )
    ),
  run: async (bot, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const { member } = interaction;

      if (!member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        await interaction.editReply({
          content: "You do not have permission to run this command."
        });
        return;
      }
      const role = interaction.options.getRole("role", true);
      const level = interaction.options.getInteger("level", true);
      const action = interaction.options.getSubcommand(true);

      let success = false;
      if (action === "create") {
        success = !!(await bot.db.levelRoles
          .create({
            data: {
              serverId: interaction.guild.id,
              roleId: role.id,
              level
            }
          })
          .catch(() => null));
      }
      if (action === "delete") {
        success = !!(await bot.db.levelRoles
          .delete({
            where: {
              serverId_level_roleId: {
                serverId: interaction.guild.id,
                roleId: role.id,
                level
              }
            }
          })
          .catch(() => null));
      }

      await interaction.editReply({
        content: success
          ? `Successfully ${action}ed your level ${level} ${role} assignment.`
          : `Failed to ${action} your level ${level} ${role} assignment.`
      });
    } catch (err) {
      const id = await errorHandler(bot, "level roles command", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
