import client, { Counter, Gauge } from "prom-client";
import type { ExtendedClient } from "../interfaces/ExtendedClient.js";

export class Prometheus {
  private client = client;
  private guilds: Gauge;
  private commands: Counter;

  constructor(bot: ExtendedClient) {
    this.guilds = new Gauge({
      name: "guilds",
      help: "The number of guilds the bot is in."
    });
    this.guilds.set(bot.guilds.cache.size);
    this.commands = new Counter({
      name: "commands",
      help: "The number of commands that have been used since last boot."
    });
    this.client.collectDefaultMetrics();
  }

  public commandUsed() {
    this.commands.inc();
  }

  public updateGuilds(bot: ExtendedClient) {
    this.guilds.set(bot.guilds.cache.size);
  }
}
