import { configs } from "@prisma/client";

export const defaultConfig: Omit<configs, "id"> = {
  serverId: "",
  inviteLink: "",
  banAppealLink: "",
  modLogChannel: "",
  eventLogChannel: "",
  messageReportChannel: "",
  birthdayChannel: "",
  joinRole: ""
};
