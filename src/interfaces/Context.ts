import { ExtendedClient } from "./ExtendedClient";
import { GuildContextInteraction } from "./Interactions";

export interface Context {
  data: {
    name: string;
    type: 2 | 3;
  };
  run: (
    bot: ExtendedClient,
    interaction: GuildContextInteraction
  ) => Promise<void>;
}
