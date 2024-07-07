import { PrismaClient } from "@prisma/client";
import data from "../export.json";
import { Client, GatewayIntentBits } from "discord.js";

const id = "443134315778539530";

(async () => {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
  });
  await client.login(
    "REDACTED_SECRET"
  );
  const guild = client.guilds.cache.get(id);
  if (!guild) {
    throw new Error("Cannot find Caylus' server.");
  }
  const members = await guild.members.fetch();
  const existing = data
    .filter((d) => members.has(d.userId))
    .map((d) => ({
      userId: d.userId,
      serverId: id,
      birthday: new Date(d.birthday)
    }));
  const db = new PrismaClient({
    datasourceUrl:
      "mongodb+srv://modbot:6NriYlDECa3e9nCC@nhcarrigan.4jqem.mongodb.net/modbot?retryWrites=true&w=majority"
  });
  await db.birthdays.createMany({ data: existing });
  await db.$disconnect();
})();
