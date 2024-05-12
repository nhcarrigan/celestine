import { readdir } from "fs/promises";
import { join } from "path";

import { Context } from "../interfaces/Context";
import { ExtendedClient } from "../interfaces/ExtendedClient";

import { errorHandler } from "./errorHandler";

/**
 * Reads the `/contexts` directory and dynamically imports the files,
 * then pushes the imported data to an array.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @returns {Context[]} Array of Context objects representing the imported context commands.
 */
export const loadContexts = async (bot: ExtendedClient): Promise<Context[]> => {
  try {
    const result: Context[] = [];
    const files = await readdir(
      join(process.cwd(), "prod", "contexts"),
      "utf-8"
    );
    for (const file of files) {
      const name = file.split(".")[0];
      if (!name) {
        continue;
      }
      const mod = await import(join(process.cwd(), "prod", "contexts", file));
      result.push(mod[name] as Context);
    }
    return result;
  } catch (err) {
    await errorHandler(bot, "slash command loader", err);
    return [];
  }
};
