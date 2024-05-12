import { logChannelChoicesMap } from "../../../config/LogChannelChoices";
import { CommandHandler } from "../../../interfaces/CommandHandler";
import { ExtendedClient } from "../../../interfaces/ExtendedClient";
import { errorHandler } from "../../../utils/errorHandler";
import { setConfig } from "../../data/setConfig";

/**
 * Sets the logging channel for the server.
 */
export const handleLogging: CommandHandler = async (bot, interaction) => {
  try {
    const logType = interaction.options.getString(
      "log-type",
      true
    ) as keyof ExtendedClient["configs"][""];
    const channel = interaction.options.getChannel("channel", true);

    const success = await setConfig(
      bot,
      interaction.guild.id,
      logType,
      channel.id
    );

    if (success) {
      await interaction.editReply({
        content: `Your server will log ${logChannelChoicesMap[logType]} in <#${channel.id}>.`
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
