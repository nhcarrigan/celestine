import { logHandler } from "../../utils/logHandler";

/**
 * Sends a message to the debug hook when the bot disconnects.
 */
export const onDisconnect = async () => {
  await logHandler.log("warn", "Bot has disconnected from Discord.");
};
