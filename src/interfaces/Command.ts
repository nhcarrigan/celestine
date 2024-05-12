import {
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from "discord.js";

import { ExtendedClient } from "./ExtendedClient";
import { GuildCommandInteraction } from "./Interactions";

export interface Command {
  data:
    | SlashCommandOptionsOnlyBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    | SlashCommandSubcommandsOnlyBuilder;
  run: (
    bot: ExtendedClient,
    interaction: GuildCommandInteraction
  ) => Promise<void>;
}
