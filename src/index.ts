import { Client } from "discord.js";

import { IntentOptions } from "./config/IntentOptions";
import { connectDatabase } from "./database/connectDatabase";
import { handleEvents } from "./events/_handleEvents";
import { ExtendedClient } from "./interfaces/ExtendedClient";
import { validateEnv } from "./modules/validateEnv";
import { serve } from "./server/serve";
import { loadCommands } from "./utils/loadCommands";
import { loadContexts } from "./utils/loadContexts";

(async () => {
  const bot = new Client({ intents: IntentOptions }) as ExtendedClient;
  bot.env = validateEnv();
  bot.configs = {};
  bot.commands = await loadCommands(bot);
  bot.contexts = await loadContexts(bot);

  await connectDatabase(bot);
  handleEvents(bot);
  serve();

  await bot.login(bot.env.token);
})();
