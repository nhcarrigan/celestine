import {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  Guild,
  GuildMember
} from "discord.js";

import {
  GuildCommandInteraction,
  GuildContextInteraction
} from "../interfaces/Interactions";

/**
 * Validates that a slash command payload has the guild and member.
 *
 * @param {ChatInputCommandInteraction} interaction The interaction payload from Discord.
 * @returns {boolean} Whether the expected properties are present.
 */
export const isGuildCommandInteraction = (
  interaction: ChatInputCommandInteraction
): interaction is GuildCommandInteraction =>
  interaction.guild instanceof Guild &&
  interaction.member instanceof GuildMember;

/**
 * Validates that a slash command payload has the guild and member.
 *
 * @param {ContextMenuCommandInteraction} interaction The interaction payload from Discord.
 * @returns {boolean} Whether the expected properties are present.
 */
export const isGuildContextInteraction = (
  interaction: ContextMenuCommandInteraction
): interaction is GuildContextInteraction => interaction.guild instanceof Guild;
