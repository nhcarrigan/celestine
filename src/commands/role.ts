import { SlashCommandBuilder } from "discord.js";

import { Command } from "../interfaces/Command";
import { errorHandler } from "../utils/errorHandler";

export const role: Command = {
  data: new SlashCommandBuilder()
    .setDMPermission(false)
    .setName("role")
    .setDescription("Give yourself a permitted role, or remove it.")
    .addRoleOption((o) =>
      o.setName("role").setDescription("The role to toggle.").setRequired(true)
    ),
  run: async (bot, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const role = interaction.options.getRole("role", true);
      const isPermitted = await bot.db.roles
        .findUnique({
          where: {
            serverId_roleId: {
              serverId: interaction.guild.id,
              roleId: role.id
            }
          }
        })
        .catch(() => null);
      if (!isPermitted) {
        await interaction.editReply({
          content: `The <@&${role.id}> role is not self-assignable.`
        });
        return;
      }
      if (interaction.member.roles.cache.has(role.id)) {
        await interaction.member.roles.remove(role.id);
        await interaction.editReply({
          content: `The <@&${role.id}> role has been removed.`
        });
        return;
      }
      await interaction.member.roles.add(role.id);
      await interaction.editReply({
        content: `The <@&${role.id}> role has been added.`
      });
    } catch (err) {
      const id = await errorHandler(bot, "role command", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
