import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { errorHandler } from "../../utils/errorHandler";

/**
 * Checks if a domain is a known source of Discord scams.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {string} domain The domain to validate. DO NOT include the protocol or path.
 * @returns {boolean} True if the domain is known as a scam.
 */
export const checkSpamDomain = async (
  bot: ExtendedClient,
  domain: string
): Promise<boolean> => {
  try {
    const walshyReq = await fetch("https://bad-domains.walshy.dev/check", {
      method: "POST",
      headers: {
        accept: "application/json",
        "X-Identity": "Naomi's mod bot - built by naomi_lgbt"
      },
      body: JSON.stringify({ domain })
    });
    const walshyRes = (await walshyReq.json()) as { badDomain: boolean };
    if (walshyRes.badDomain) {
      return true;
    }
    const yachtsReq = await fetch(
      `https://phish.sinking.yachts/v2/check/${encodeURI(domain)}`,
      {
        headers: {
          accept: "application/json",
          "X-Identity": "Naomi's mod bot - built by naomi_lgbt"
        }
      }
    );
    const yachtsRes = (await yachtsReq.json()) as boolean;
    if (yachtsRes) {
      return true;
    }
    return false;
  } catch (err) {
    await errorHandler(bot, "load spam domains", err);
    return false;
  }
};
