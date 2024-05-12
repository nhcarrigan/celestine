import { ContextMenuCommandInteraction } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { errorHandler } from "../../utils/errorHandler";
import { isGuildContextInteraction } from "../validateGuildCommands";

/**
 * Handles the logic for running context commands.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {ContextMenuCommandInteraction} interaction The interaction payload from Discord.
 */
export const handleContextMenuCommand = async (
  bot: ExtendedClient,
  interaction: ContextMenuCommandInteraction
) => {
  try {
    if (!isGuildContextInteraction(interaction)) {
      await interaction.reply({
        content: "You can only use this in a server.",
        ephemeral: true
      });
      return;
    }
    const context = bot.contexts.find(
      (c) => c.data.name === interaction.commandName
    );
    if (!context) {
      await interaction.reply({
        content: "That's not a valid context. Please contact Naomi.",
        ephemeral: true
      });
      return;
    }
    await context.run(bot, interaction);
  } catch (err) {
    const id = await errorHandler(bot, "handle context menu command", err);
    await interaction.editReply({
      content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
    });
  }
};
