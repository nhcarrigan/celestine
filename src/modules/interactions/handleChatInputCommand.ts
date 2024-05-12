import { ChatInputCommandInteraction } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { errorHandler } from "../../utils/errorHandler";
import { isModerator } from "../../utils/isModerator";
import { isGuildCommandInteraction } from "../validateGuildCommands";

/**
 * Handles the logic for running slash commands.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {ChatInputCommandInteraction} interaction The interaction payload from Discord.
 */
export const handleChatInputCommand = async (
  bot: ExtendedClient,
  interaction: ChatInputCommandInteraction
) => {
  try {
    if (!isGuildCommandInteraction(interaction)) {
      await interaction.reply({
        content: "You can only use commands in a server.",
        ephemeral: true
      });
      return;
    }
    const command = bot.commands.find(
      (c) => c.data.name === interaction.commandName
    );
    if (!command) {
      await interaction.reply({
        content: "That's not a valid command. Please contact Naomi.",
        ephemeral: true
      });
      return;
    }
    if (
      (!interaction.member || !isModerator(interaction.member)) &&
      !["leaderboard", "rank", "profile", "role", "help", "ping"].includes(
        interaction.commandName
      )
    ) {
      await interaction.reply({
        content: "You must be a moderator to use bot commands.",
        ephemeral: true
      });
      return;
    }
    await command.run(bot, interaction);
  } catch (err) {
    const id = await errorHandler(bot, "handle chat input command", err);
    await interaction.editReply({
      content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
    });
  }
};
