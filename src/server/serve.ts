import http from "http";

import express from "express";
import { register } from "prom-client";

import { ExtendedClient } from "../interfaces/ExtendedClient";

/**
 * Instantiates the web server for GitHub webhooks.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 */
export const serve = async (bot: ExtendedClient) => {
  const app = express();

  app.get("/", (_req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
  <head>
    <title>Celestine</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="A paid moderation bot for Discord." />
    <script src="https://cdn.nhcarrigan.com/headers/index.js" async defer></script>
  </head>
  <body>
    <main>
    <h1>Celestine</h1>
     <img src="https://cdn.nhcarrigan.com/new-avatars/celestine-full.png" width="250" alt="Celestine" />
    <section>
      <p>A paid moderation bot for Discord.</p>
      <a href="https://discord.com/oauth2/authorize?client_id=1235128719836712970&permissions=8&integration_type=0&scope=bot+applications.commands" class="social-button discord-button" style="display: inline-block; background-color: #5865F2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 5px;">
        <i class="fab fa-discord"></i> Add to Discord
      </a>
    </section>
    <section>
        <h2>Links</h2>
        <p>
            <a href="https://codeberg.org/nhcarrigan/mod-bot">
                <i class="fa-solid fa-code"></i> Source Code
            </a>
        </p>
        <p>
            <a href="https://docs.nhcarrigan.com">
                <i class="fa-solid fa-book"></i> Documentation
            </a>
        </p>
        <p>
            <a href="https://chat.nhcarrigan.com">
                <i class="fa-solid fa-circle-info"></i> Support
            </a>
        </p>
    </section>
    </main>
  </body>
</html>      
`);
  });

  app.get("/metrics", async (_req, res) => {
    try {
      res.set("Content-Type", register.contentType);
      res.end(await register.metrics());
    } catch (err) {
      res.status(500).end(err);
    }
  });

  const httpServer = http.createServer(app);

  httpServer.listen(9080, async () => {
    await bot.env.debugHook.send({
      content: "http server listening on port 9080",
      username: bot.user?.username ?? "bot",
      avatarURL:
        bot.user?.displayAvatarURL() ??
        "https://cdn.nhcarrigan.com/avatars/nhcarrigan.png"
    });
  });
};
