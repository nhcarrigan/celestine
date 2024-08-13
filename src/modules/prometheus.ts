import client, { Counter, Gauge } from "prom-client";
import type { ExtendedClient } from "../interfaces/ExtendedClient";
import { checkEntitledGuild } from "../utils/checkEntitledGuild";

export class Prometheus {
  private client = client;
  private guilds: Gauge;
  private entitled: Gauge;
  private commands: Counter;
  private users: Gauge;
  private errors: Counter;

  constructor(bot: ExtendedClient) {
    this.guilds = new Gauge({
      name: "guilds",
      help: "The number of guilds the bot is in."
    });
    this.entitled = new Gauge({
      name: "entitled",
      help: "The number of guilds the bot is in."
    });
    this.updateGuilds(bot);
    this.commands = new Counter({
      name: "commands",
      help: "The number of commands that have been used since last boot."
    });
    this.users = new Gauge({
      name: "users",
      help: "The number of users the bot knows."
    });
    this.users.set(
      bot.guilds.cache.reduce(
        (members, guild) => members + guild.memberCount,
        0
      )
    );
    this.errors = new Counter({
      name: "errors",
      help: "The number of errors handled by the process."
    });
    this.client.collectDefaultMetrics();
  }

  public commandUsed() {
    this.commands.inc();
  }

  public updateGuilds(bot: ExtendedClient) {
    this.guilds.set(bot.guilds.cache.size);
  }

  public updateUsers(bot: ExtendedClient) {
    this.users.set(
      bot.guilds.cache.reduce(
        (members, guild) => members + guild.memberCount,
        0
      )
    );
  }

  public async updateEntitlements(bot: ExtendedClient) {
    const entitled = bot.guilds.cache.filter(
      async (g) => await checkEntitledGuild(bot, g)
    );
    this.entitled.set(entitled.size);
  }

  public errorHandled() {
    this.errors.inc();
  }
}
