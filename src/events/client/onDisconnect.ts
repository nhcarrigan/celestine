import { EmbedBuilder } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";

/**
 * Sends a message to the debug hook when the bot disconnects.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 */
export const onDisconnect = async (bot: ExtendedClient) => {
  const disconnectEmbed = new EmbedBuilder();
  disconnectEmbed.setTitle("Disconnected");
  disconnectEmbed.setDescription("I have been disconnected from Discord.");
  disconnectEmbed.setTimestamp();
  await bot.env.debugHook.send({ embeds: [disconnectEmbed] });
};
