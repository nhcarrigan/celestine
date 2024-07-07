import { CommandHandler } from "../../../interfaces/CommandHandler";
import { errorHandler } from "../../../utils/errorHandler";
import { setConfig } from "../../data/setConfig";

/**
 * Sets the role to be assigned when a member joins.
 */
export const handleJoinRole: CommandHandler = async (bot, interaction) => {
  try {
    const role = interaction.options.getRole("role", true);

    const success = await setConfig(
      bot,
      interaction.guild.id,
      "joinRole",
      role.id
    );

    if (success) {
      await interaction.editReply({
        content: `Members will be given ${role.toString()} when they join..`
      });
      return;
    }
    await interaction.editReply({
      content: "Failed to set the settings."
    });
  } catch (err) {
    const id = await errorHandler(bot, "config join-role subcommand", err);
    await interaction.editReply({
      content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
    });
  }
};
