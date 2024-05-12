import { CommandHandler } from "../../../interfaces/CommandHandler";
import { errorHandler } from "../../../utils/errorHandler";

/**
 * Toggles a role to be self-assignable or not.
 */
export const handleRole: CommandHandler = async (bot, interaction) => {
  try {
    const role = interaction.options.getRole("role", true);
    const exists = await bot.db.roles.findUnique({
      where: {
        serverId_roleId: {
          serverId: interaction.guild.id,
          roleId: role.id
        }
      }
    });
    if (exists) {
      await bot.db.roles.delete({
        where: {
          serverId_roleId: {
            serverId: interaction.guild.id,
            roleId: role.id
          }
        }
      });
      await interaction.editReply({
        content: `Your <@&${role.id}> role is no longer self-assignable.`
      });
      return;
    }
    await bot.db.roles.create({
      data: {
        serverId: interaction.guild.id,
        roleId: role.id
      }
    });
    await interaction.editReply({
      content: `Your <@&${role.id}> role is now self-assignable.`
    });
  } catch (err) {
    const id = await errorHandler(bot, "automod logging subcommand", err);
    await interaction.editReply({
      content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
    });
  }
};
