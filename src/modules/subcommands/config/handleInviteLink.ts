import { CommandHandler } from "../../../interfaces/CommandHandler";
import { errorHandler } from "../../../utils/errorHandler";
import { setConfig } from "../../data/setConfig";

/**
 * Sets the invite link for the server.
 */
export const handleInviteLink: CommandHandler = async (bot, interaction) => {
  try {
    const link = interaction.options.getString("link", true);

    const success = await setConfig(
      bot,
      interaction.guild.id,
      "inviteLink",
      link
    );

    if (success) {
      await interaction.editReply({
        content: `Members who are kicked will be invited back with <${link}>.`
      });
      return;
    }
    await interaction.editReply({
      content: "Failed to set the settings."
    });
  } catch (err) {
    const id = await errorHandler(bot, "automod logging subcommand", err);
    await interaction.editReply({
      content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
    });
  }
};
