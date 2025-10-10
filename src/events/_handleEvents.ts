import { DiscordAnalytics } from "@nhcarrigan/discord-analytics";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { checkEntitledGuild } from "../utils/checkEntitledGuild";

import { onDisconnect } from "./client/onDisconnect";
import { onReady } from "./client/onReady";
import { onAuditLogEntry } from "./guild/onAuditLogEntry";
import { onGuildCreate } from "./guild/onGuildCreate";
import { onGuildDelete } from "./guild/onGuildDelete";
import { onInteraction } from "./interaction/onInteraction";
import { onMemberAdd } from "./member/onMemberAdd";
import { onMemberRemove } from "./member/onMemberRemove";
import { onMemberUpdate } from "./member/onMemberUpdate";
import { onMessage } from "./message/onMessage";
import { onMessageDelete } from "./message/onMessageDelete";
import { onMessageEdit } from "./message/onMessageEdit";
import { onThreadCreate } from "./thread/onThreadCreate";
import { onThreadDelete } from "./thread/onThreadDelete";
import { onThreadUpdate } from "./thread/onThreadUpdate";
import { onVoiceUpdate } from "./voice/onVoiceUpdate";
import { logHandler } from "../utils/logHandler.js";

/**
 * Module to mount the Discord event listeners.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 */
export const handleEvents = (bot: ExtendedClient) => {
  const analytics = new DiscordAnalytics(bot, logHandler);

  /* Client Events */
  bot.once("ready", async () => {
    await onReady(bot);
    analytics.startCron();
  });
  bot.on("disconnect", () => onDisconnect());

  /* Message Events */
  bot.on("messageCreate", async (message) => {
    if (!message.guild || !(await checkEntitledGuild(bot, message.guild))) {
      return;
    }
    await onMessage(bot, message);
  });
  bot.on("messageDelete", async (message) => {
    if (!message.guild || !(await checkEntitledGuild(bot, message.guild))) {
      return;
    }
    await onMessageDelete(bot, message);
  });
  bot.on("messageDeleteBulk", async (messages) => {
    const guild = messages.first()?.guild;
    if (!guild || !(await checkEntitledGuild(bot, guild))) {
      return;
    }
    for (const message of messages.values()) {
      await onMessageDelete(bot, message);
    }
  });
  bot.on("messageUpdate", async (oldMessage, newMessage) => {
    if (
      !newMessage.guild ||
      !(await checkEntitledGuild(bot, newMessage.guild))
    ) {
      return;
    }
    await onMessageEdit(bot, oldMessage, newMessage);
  });

  /* Interaction Events */
  bot.on(
    "interactionCreate",
    async (interaction) => await onInteraction(bot, interaction)
  );

  /* Thread Events */
  bot.on("threadCreate", async (thread) => {
    if (!thread.guild || !(await checkEntitledGuild(bot, thread.guild))) {
      return;
    }
    await onThreadCreate(bot, thread);
  });
  bot.on("threadDelete", async (thread) => {
    if (!thread.guild || !(await checkEntitledGuild(bot, thread.guild))) {
      return;
    }
    await onThreadDelete(bot, thread);
  });
  bot.on("threadUpdate", async (oldThread, newThread) => {
    if (!newThread.guild || !(await checkEntitledGuild(bot, newThread.guild))) {
      return;
    }
    await onThreadUpdate(bot, oldThread, newThread);
  });

  /* Voice Events */
  bot.on("voiceStateUpdate", async (oldVoice, newVoice) => {
    if (!newVoice.guild || !(await checkEntitledGuild(bot, newVoice.guild))) {
      return;
    }
    await onVoiceUpdate(bot, oldVoice, newVoice);
  });

  /* Member Events */
  bot.on("guildMemberAdd", async (member) => {
    if (!member.guild || !(await checkEntitledGuild(bot, member.guild))) {
      return;
    }
    await onMemberAdd(bot, member);
  });
  bot.on("guildMemberRemove", async (member) => {
    if (!member.guild || !(await checkEntitledGuild(bot, member.guild))) {
      return;
    }
    await onMemberRemove(bot, member);
  });
  bot.on("guildMemberUpdate", async (oldMember, newMember) => {
    if (!newMember.guild || !(await checkEntitledGuild(bot, newMember.guild))) {
      return;
    }
    await onMemberUpdate(bot, oldMember, newMember);
  });

  /* Guild Events */
  bot.on("guildAuditLogEntryCreate", async (log, guild) => {
    if (!guild || !(await checkEntitledGuild(bot, guild))) {
      return;
    }
    await onAuditLogEntry(bot, log, guild);
  });

  bot.on("guildCreate", async (guild) => {
    if (!guild || !(await checkEntitledGuild(bot, guild))) {
      return;
    }
    await onGuildCreate(bot, guild);
  });

  bot.on("guildDelete", async (guild) => {
    if (!guild) {
      return;
    }
    await onGuildDelete(bot, guild);
  });
};
