import { VoiceState } from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { getConfig } from "../../modules/data/getConfig";
import { errorHandler } from "../../utils/errorHandler";

/**
 * Handles voice state updates.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {VoiceState} oldVoice The old voice state.
 * @param {VoiceState} newVoice The new voice state.
 */
export const onVoiceUpdate = async (
  bot: ExtendedClient,
  oldVoice: VoiceState,
  newVoice: VoiceState
) => {
  try {
    const config = await getConfig(bot, newVoice.guild.id);

    if (!config.eventLogChannel || !newVoice.member) {
      return;
    }

    const channel =
      newVoice.guild.channels.cache.get(config.eventLogChannel) ||
      (await newVoice.guild.channels.fetch(config.eventLogChannel));

    if (!channel || !("send" in channel)) {
      return;
    }

    if (
      oldVoice.channelId &&
      newVoice.channelId &&
      oldVoice.channelId !== newVoice.channelId
    ) {
      await channel.send({
        content: `${newVoice.member.user.tag} (${newVoice.member.id}) has moved from <#!${oldVoice.channelId}> to <#!${newVoice.channelId}>.`
      });
    }

    if (oldVoice.channelId && !newVoice.channelId) {
      await channel.send({
        content: `${newVoice.member.user.tag} (${newVoice.member.id}) has disconnected from <#!${oldVoice.channelId}>.`
      });
    }

    if (!oldVoice.channelId && newVoice.channelId) {
      await channel.send({
        content: `${newVoice.member.user.tag} (${newVoice.member.id}) has connected to <#!${newVoice.channelId}>.`
      });
    }

    if (oldVoice.mute && !newVoice.mute) {
      await channel.send({
        content: `${newVoice.member.user.tag} (${newVoice.member.id}) has been unmuted.`
      });
    }

    if (!oldVoice.mute && newVoice.mute) {
      await channel.send({
        content: `${newVoice.member.user.tag} (${newVoice.member.id}) has been muted.`
      });
    }

    if (oldVoice.deaf && !newVoice.deaf) {
      await channel.send({
        content: `${newVoice.member.user.tag} (${newVoice.member.id}) has been undeafened.`
      });
    }

    if (!oldVoice.deaf && newVoice.deaf) {
      await channel.send({
        content: `${newVoice.member.user.tag} (${newVoice.member.id}) has been deafened.`
      });
    }
  } catch (err) {
    await errorHandler(bot, "on voice update", err);
  }
};
