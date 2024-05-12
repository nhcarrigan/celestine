import { Action } from "../interfaces/Action";

export const EmbedColours: { [K in Action]: number } = {
  ban: 0xfa000c,
  softban: 0xfa9900,
  kick: 0xffee00,
  warn: 0x2600ff,
  mute: 0xd900ff,
  unmute: 0x00ff22,
  unban: 0x00ff22,
  note: 0x000001
};
