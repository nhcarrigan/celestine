import { levels } from "@prisma/client";
import { AttachmentBuilder } from "discord.js";
import nodeHtmlToImage from "node-html-to-image";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { errorHandler } from "../../utils/errorHandler";

/**
 * Creates an image from the user's profile settings, converts it into a Discord
 * attachment, and returns it.
 *
 * @param {ExtendedClient} CamperChan The CamperChan's Discord instance.
 * @param {levels} record The user's record from the database.
 * @returns {AttachmentBuilder} The attachment, or null on error.
 */
export const generateProfileImage = async (
  CamperChan: ExtendedClient,
  record: levels
): Promise<AttachmentBuilder | null> => {
  try {
    const {
      avatar,
      backgroundColour,
      backgroundImage,
      colour,
      username,
      level,
      points
    } = record;

    const html = `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      @font-face {
        font-family: "Roboto";
        src: url("https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700");
      }
      body { 
        background: url(${backgroundImage}) no-repeat center center fixed;
        background-size: cover;
        width: 1920px;
        height: 1080px;
        text-align: center;
        font-family: "Roboto", Courier, monospace;
        font-size: 75px;
        padding: 2.5%;
      }

      h1 {
        font-size: 150px;
      }

      main {
        width: 100%;
        height: 100%;
        background-color: #${backgroundColour}bf;
        color: #${colour};
        padding: 2.5%;
        border-radius: 100px;
      }

      .avatar {
        width: 250px;
        height: 250px;
        border-radius: 50%;
      }

      h2 {
        font-size: 125px;
      }

      .header {
        width: 100%;
        display: grid;
        grid-template-columns: 250px auto;
        justify-items: center;
        align-items: center;
      }
    </style>
    <body>
      <main>
        <div class="header">
          <img class="avatar" src=${avatar || "https://cdn.freecodecamp.org/platform/universal/fcc_puck_500.jpg"}></img>
          <div>
            <h1>${username}</h1>
            <p>Level ${level} (${points.toLocaleString("en-GB")}xp)</p>
          </div>
        </div>
      </main>
    </body>
    `;
    const alt = `${username} is at level ${level} with ${points.toLocaleString("en-GB")} experience points.`;

    const image = await nodeHtmlToImage({
      html,
      selector: "body",
      transparent: true
    });

    if (!(image instanceof Buffer)) {
      return null;
    }

    const attachment = new AttachmentBuilder(image, {
      name: `${username}.png`,
      description: alt
    });

    return attachment;
  } catch (err) {
    await errorHandler(CamperChan, "generate profile image module", err);
    return null;
  }
};

/**
 * Generates the image for the leaderboard.
 *
 * @param {ExtendedClient} CamperChan The CamperChan's Discord instance.
 * @param {levels} levels The user's record from the database.
 * @returns {AttachmentBuilder} The attachment, or null on error.
 */
export const generateLeaderboardImage = async (
  CamperChan: ExtendedClient,
  levels: (levels & { index: number })[]
): Promise<AttachmentBuilder | null> => {
  try {
    const html = `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      @font-face {
        font-family: "Roboto";
        src: url("https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700");
      }
      body { 
        background: transparent;
        height: 4100px;
        width: 2510px;
      }

      img {
        width: 250px;
        height: 250px;
      }

      h1 {
        font-size: 150px;
      }

      p {
        font-size: 100px;
        font-weight: bold;
      }

      .row {
        width: 2500px;
        display: grid;
        grid-template-columns: 250px 2250px;
        height: 400px;
        margin: 5px 10px;
        justify-items: left;
        align-items: center;
      }
    </style>
    <body>
      ${levels.map(
        (l) =>
          `<div class="row" style="background-color: #${l.backgroundColour || "0a0a23"}bf;color: #${l.colour || "d0d0d5"};padding: 2.5%;border-radius: 100px;">
            <img style="border-radius: 50%;" src=${l.avatar || "https://cdn.freecodecamp.org/platform/universal/fcc_puck_500.jpg"}></img>
            <div style="text-align: left;padding-left:100px;">
              <h1>#${l.index}. ${l.username}</h1>
              <p>Level ${l.level} (${l.points}xp)</p>
            </div>
          </div>`
      )}
    </body>
    `;
    const alt = levels
      .map(
        (l) =>
          `${l.username} is rank ${l.index} at ${l.level} with ${l.points.toLocaleString("en-GB")} experience points.`
      )
      .join(", ");

    const image = await nodeHtmlToImage({
      html,
      selector: "body",
      transparent: true
    });

    if (!(image instanceof Buffer)) {
      return null;
    }

    const attachment = new AttachmentBuilder(image, {
      name: `leaderboard-${levels[0]?.index}.png`,
      description: alt
    });

    return attachment;
  } catch (err) {
    await errorHandler(CamperChan, "generate leaderboard image module", err);
    return null;
  }
};
