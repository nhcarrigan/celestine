import { PrismaClient, configs } from "@prisma/client";
import { Client } from "discord.js";

import { Command } from "./Command";
import { Context } from "./Context";

export interface ExtendedClient extends Client {
  env: {
    token: string;
    mongoUri: string;
    devMode: boolean;
  };
  db: PrismaClient;
  commands: Command[];
  contexts: Context[];
  configs: { [serverId: string]: Omit<configs, "id"> };
}
