import { PermissionFlagsBits } from "discord.js";

import { CommandHandler } from "../../../interfaces/CommandHandler";
import { errorHandler } from "../../../utils/errorHandler";
import { setConfig } from "../../data/setConfig";

/**
 * Sets the birthday channel for the server.
 */
export const handleBirthdayChannel: CommandHandler = async (
  bot,
  interaction
) => {
  try {
    const channel = interaction.options.getChannel("channel", true);
    if (!("send" in channel)) {
      await interaction.editReply({
        content: "You must specify a text channel!"
      });
      return;
    }
    const me = await interaction.guild.members.fetchMe();
    if (!me.permissionsIn(channel).has(PermissionFlagsBits.SendMessages)) {
      await interaction.editReply({
        content: "I can't send messages there. :c"
      });
      return;
    }

    const success = await setConfig(
      bot,
      interaction.guild.id,
      "birthdayChannel",
      channel.id
    );

    if (success) {
      await interaction.editReply({
        content: `Birthdays will be posted in ${channel.toString()}. Members can set their birthdays with the \`/birthday\` command.`
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
