import { configs } from "@prisma/client";

export const logChannelChoices: { name: string; value: keyof configs }[] = [
  { name: "Moderation Action Log Channel", value: "modLogChannel" },
  { name: "Private Event Log Channel", value: "eventLogChannel" },
  { name: "Message Reporting Channel", value: "messageReportChannel" }
];

export const logChannelChoicesMap: {
  [key: string]: string;
} = {
  modLogChannel: "moderation actions",
  eventLogChannel: "gateway events",
  messageReportChannel: "message reports"
};
