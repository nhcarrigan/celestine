import { ExtendedClient } from "./ExtendedClient";
import { GuildCommandInteraction } from "./Interactions";

export type CommandHandler = (
  bot: ExtendedClient,
  interaction: GuildCommandInteraction,
  config: ExtendedClient["configs"][""]
) => Promise<void>;
