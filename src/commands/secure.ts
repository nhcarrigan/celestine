import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { Command } from "../interfaces/Command";
import { errorHandler } from "../utils/errorHandler";

export const secure: Command = {
  data: new SlashCommandBuilder()
    .setName("secure")
    .setDescription(
      "Toggles the feature to keep dms/invites locked or unlocked"
    )
    .setDMPermission(false)
    .addBooleanOption((option) =>
      option
        .setName("invites")
        .setDescription("Keep invites locked down?")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("dms")
        .setDescription("Keep DMs locked down?")
        .setRequired(true)
    ),
  run: async (bot, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const { guild, member } = interaction;
      const lockInvites = interaction.options.getBoolean("invites", true);
      const lockDms = interaction.options.getBoolean("dms", true);

      if (
        ![
          PermissionFlagsBits.Administrator,
          PermissionFlagsBits.KickMembers,
          PermissionFlagsBits.BanMembers,
          PermissionFlagsBits.ManageGuild
        ].some((perm) => member.permissions.has(perm))
      ) {
        await interaction.editReply({
          content: "You do not have permission to use this command."
        });
        return;
      }

      const botMember = await guild.members
        .fetch(bot.user?.id || "oopsie")
        .catch(() => null);

      if (
        !botMember ||
        ![
          PermissionFlagsBits.Administrator,
          PermissionFlagsBits.KickMembers,
          PermissionFlagsBits.BanMembers,
          PermissionFlagsBits.ManageGuild
        ].some((perm) => botMember.permissions.has(perm))
      ) {
        await interaction.editReply({
          content: "I do not have the correct permissions to do this."
        });
        return;
      }

      const date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

      await bot.db.security.upsert({
        where: { serverId: guild.id },
        update: { lockDms, lockInvites },
        create: { lockDms, lockInvites, serverId: guild.id }
      });

      await fetch(
        `https://discord.com/api/v10/guilds/${guild.id}/incident-actions`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bot ${bot.env.token}`,
            "content-type": "application/json"
          },
          body: JSON.stringify({
            dms_disabled_until: lockDms ? date : null,
            invites_disabled_until: lockInvites ? date : null
          })
        }
      ).catch(
        async (e) =>
          await errorHandler(bot, `incident-actions for ${guild.id}`, e)
      );
      await interaction.editReply({
        content: `Security options have been updated.\nInvites are ${
          lockInvites ? "disabled" : "enabled"
        }.\nDMs are ${lockDms ? "disabled" : "enabled"}.`
      });
    } catch (err) {
      const id = await errorHandler(bot, "secure command", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
