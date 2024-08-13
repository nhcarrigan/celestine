import { PrismaClient, configs } from "@prisma/client";
import { Client, WebhookClient } from "discord.js";

import { Command } from "./Command";
import { Context } from "./Context";

import type { Prometheus } from "../modules/prometheus.js";

export interface ExtendedClient extends Client {
  env: {
    token: string;
    debugHook: WebhookClient;
    mongoUri: string;
    devMode: boolean;
  };
  db: PrismaClient;
  analytics: Prometheus;
  commands: Command[];
  contexts: Context[];
  configs: { [serverId: string]: Omit<configs, "id"> };
}
