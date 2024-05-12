type PastAction =
  | "warned"
  | "kicked"
  | "banned"
  | "muted"
  | "unmuted"
  | "unbanned"
  | "noted"
  | "softbanned";

export type Action =
  | "warn"
  | "kick"
  | "ban"
  | "mute"
  | "unmute"
  | "unban"
  | "note"
  | "softban";

export const ActionToPastTense: { [key in Action]: PastAction } = {
  warn: "warned",
  kick: "kicked",
  ban: "banned",
  mute: "muted",
  unmute: "unmuted",
  unban: "unbanned",
  note: "noted",
  softban: "softbanned"
};
