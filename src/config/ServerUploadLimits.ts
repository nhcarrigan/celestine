import { GuildPremiumTier } from "discord.js";

export const ServerUploadLimits: { [tier in GuildPremiumTier]: number } = {
  0: 8000000,
  1: 8000000,
  2: 50000000,
  3: 100000000
};
