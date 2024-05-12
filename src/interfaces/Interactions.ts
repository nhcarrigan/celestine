import {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  Guild,
  GuildMember
} from "discord.js";

export interface GuildCommandInteraction extends ChatInputCommandInteraction {
  guild: Guild;
  member: GuildMember;
}

export interface GuildContextInteraction extends ContextMenuCommandInteraction {
  guild: Guild;
}
