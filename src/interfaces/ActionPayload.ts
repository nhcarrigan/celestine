import { Action } from "./Action";

export interface ActionPayload {
  userId: string;
  serverId: string;
  action: Action;
  reason: string;
  moderator: string;
  duration?: number;
  pruneDays?: number | undefined;
}
