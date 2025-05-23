import { createHmac, timingSafeEqual } from "crypto";
import { readFile } from "fs/promises";
import http from "http";
import https from "https";

import { Octokit } from "@octokit/rest";
import { GuildTextBasedChannel } from "discord.js";
import express from "express";
import { register } from "prom-client";

import { IgnoredActors, ThankYou } from "../config/Github";
import { ExtendedClient } from "../interfaces/ExtendedClient";
import { errorHandler } from "../utils/errorHandler";

import { generateCommentEmbed } from "./github/generateCommentEmbed";
import { generateForkEmbed } from "./github/generateForkEmbed";
import { generateIssuesEmbed } from "./github/generateIssueEmbed";
import { generatePingEmbed } from "./github/generatePingEmbed";
import { generatePullEmbed } from "./github/generatePullEmbed";
import { generateStarEmbed } from "./github/generateStarEmbed";

/**
 * Instantiates the web server for GitHub webhooks.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 */
export const serve = async (bot: ExtendedClient) => {
  const githubSecret = process.env.GITHUB_WEBHOOK_SECRET;
  const patreonSecret = process.env.PATREON_WEBHOOK_SECRET;
  const kofiSecret = process.env.KOFI_WEBHOOK_SECRET;
  const token = process.env.GITHUB_TOKEN;
  if (!githubSecret || !token || !kofiSecret || !patreonSecret) {
    await bot.env.debugHook.send({
      content: "Missing necessary secrets.  Web server will not be started.",
      username: bot.user?.username ?? "bot",
      avatarURL:
        bot.user?.displayAvatarURL() ??
        "https://cdn.nhcarrigan.com/avatars/nhcarrigan.png"
    });
    return;
  }
  const app = express();
  app.post("/patreon", express.text({ type: "*/*" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

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

  app.post("/kofi", async (req, res) => {
    const payload = JSON.parse(req.body.data);
    const {
      verification_token: verifyToken,
      from_name: fromName,
      is_subscription_payment: isSub,
      is_first_subscription_payment: isFirstSub
    } = payload;
    if (!verifyToken) {
      await bot.env.debugHook.send({
        content:
          "Received request with no signature.\n\n" +
          JSON.stringify(req.body).slice(0, 1500),
        username: bot.user?.username ?? "bot",
        avatarURL:
          bot.user?.displayAvatarURL() ??
          "https://cdn.nhcarrigan.com/avatars/nhcarrigan.png"
      });
      res.status(400).send("Invalid payload.");
      return;
    }
    if (verifyToken !== kofiSecret) {
      await bot.env.debugHook.send({
        content:
          "Received request with bad signature.\n\n" +
          JSON.stringify(req.body).slice(0, 1500),
        username: bot.user?.username ?? "bot",
        avatarURL:
          bot.user?.displayAvatarURL() ??
          "https://cdn.nhcarrigan.com/avatars/nhcarrigan.png"
      });
      res.status(403).send("Invalid signature.");
      return;
    }
    res.status(200).send("Valid signature found!");

    // ignore recurring subscriptions
    if (isSub && !isFirstSub) {
      return;
    }

    const channel = (await bot.channels.fetch(
      "1235114666322034790"
    )) as GuildTextBasedChannel;

    await channel.send({
      content: `## Big thanks to ${fromName} for sponsoring us on KoFi!\n\nTo claim your sponsor role, please DM Naomi with your KoFi receipt.`
    });
  });

  app.post("/patreon", async (req, res) => {
    // validate headers
    const header = req.headers["x-patreon-signature"];
    if (!header) {
      await bot.env.debugHook.send({
        content:
          "Received request with no signature.\n\n" +
          String(req.body).slice(0, 1500),
        username: bot.user?.username ?? "bot",
        avatarURL:
          bot.user?.displayAvatarURL() ??
          "https://cdn.nhcarrigan.com/avatars/nhcarrigan.png"
      });
      res.status(403).send("No valid signature present.");
      return;
    }
    const hash = createHmac("MD5", patreonSecret)
      .update(req.body)
      .digest("hex");
    if (hash !== header) {
      await bot.env.debugHook.send({
        content:
          "Received request with bad signature.\n\n" +
          String(req.body).slice(0, 1500),
        username: bot.user?.username ?? "bot",
        avatarURL:
          bot.user?.displayAvatarURL() ??
          "https://cdn.nhcarrigan.com/avatars/nhcarrigan.png"
      });
      res.status(403).send("Signature is not correct.");
      return;
    }
    res.status(200).send("Signature is correct.");

    const event = req.headers["x-patreon-event"];

    if (event !== "pledges:create") {
      return;
    }

    const obj = JSON.parse(req.body);

    const user = obj.included.find(
      (obj: Record<string, string>) => obj.type === "user"
    );

    const channel = (await bot.channels.fetch(
      "1235114666322034790"
    )) as GuildTextBasedChannel;

    await channel?.send({
      content: `## Big thanks to ${user.attributes.full_name} for sponsoring us on Patreon!\n\nTo claim your sponsor role, please DM Naomi with your patreon receipt.`
    });
  });

  app.post("/github", async (req, res) => {
    try {
      const header = req.headers["x-hub-signature-256"];
      if (!header || Array.isArray(header)) {
        await bot.env.debugHook.send({
          content:
            "Received request with no signature.\n\n" +
            JSON.stringify(req.body).slice(0, 1500),
          username: bot.user?.username ?? "bot",
          avatarURL:
            bot.user?.displayAvatarURL() ??
            "https://cdn.nhcarrigan.com/avatars/nhcarrigan.png"
        });
        res.status(403).send("No valid signature present.");
        return;
      }
      const signature = createHmac("sha256", githubSecret)
        .update(JSON.stringify(req.body))
        .digest("hex");
      const trusted = Buffer.from(`sha256=${signature}`, "ascii");
      const sent = Buffer.from(header, "ascii");
      const safe = timingSafeEqual(trusted, sent);
      if (!safe) {
        await bot.env.debugHook.send({
          content:
            "Received request with bad signature.\n\n" +
            JSON.stringify(req.body).slice(0, 1500),
          username: bot.user?.username ?? "bot",
          avatarURL:
            bot.user?.displayAvatarURL() ??
            "https://cdn.nhcarrigan.com/avatars/nhcarrigan.png"
        });
        res.status(403).send("Signature is not correct.");
        return;
      }
      res.status(200).send("Signature is correct.");

      const event = req.headers["x-github-event"] as string;
      if (event === "sponsorship" && req.body.action === "created") {
        const channel = (await bot.channels.fetch(
          "1235114666322034790"
        )) as GuildTextBasedChannel;
        await channel?.send({
          content: `## Big thanks to ${req.body.sponsorship.sponsor.login} for sponsoring us on GitHub!\n\nTo claim your sponsor role, please make sure your GitHub account is connected to your Discord account, then ping Mama Naomi for your role!`
        });
      }

      if (
        IgnoredActors.includes(
          req.body.pull_request?.user.login || req.body.sender?.login
        )
      ) {
        return;
      }

      const embedGenerator = {
        ping: generatePingEmbed,
        star: generateStarEmbed,
        issues: generateIssuesEmbed,
        pull_request: generatePullEmbed,
        issue_comment: generateCommentEmbed,
        fork: generateForkEmbed
      };

      const isValidKey = (
        event: string
      ): event is keyof typeof embedGenerator => {
        return event in embedGenerator;
      };

      const content = isValidKey(event)
        ? embedGenerator[event](req.body)
        : null;

      if (content) {
        const channel = (await bot.channels.fetch(
          "1231028190403891212"
        )) as GuildTextBasedChannel;

        await channel?.send({
          content
        });
      }

      if (event === "pull_request") {
        const owner = req.body.repository.owner.login;
        const repo = req.body.repository.name;
        const number = req.body.number;
        const isMerged =
          req.body.action === "closed" && req.body.pull_request.merged;
        const github = new Octokit({
          auth: process.env.GITHUB_TOKEN
        });
        if (isMerged && req.body.pull_request?.user.login !== "naomi-lgbt") {
          await github.issues.createComment({
            owner,
            repo,
            issue_number: number,
            body: ThankYou
          });
        }
      }
    } catch (err) {
      await errorHandler(bot, "github webhook", err);
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

  if (process.env.NODE_ENV === "production") {
    const privateKey = await readFile(
      "/etc/letsencrypt/live/hooks.nhcarrigan.com/privkey.pem",
      "utf8"
    );
    const certificate = await readFile(
      "/etc/letsencrypt/live/hooks.nhcarrigan.com/cert.pem",
      "utf8"
    );
    const ca = await readFile(
      "/etc/letsencrypt/live/hooks.nhcarrigan.com/chain.pem",
      "utf8"
    );

    const credentials = {
      key: privateKey,
      cert: certificate,
      ca: ca
    };

    const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(9443, async () => {
      await bot.env.debugHook.send({
        content: "https server listening on port 9443",
        username: bot.user?.username ?? "bot",
        avatarURL:
          bot.user?.displayAvatarURL() ??
          "https://cdn.nhcarrigan.com/avatars/nhcarrigan.png"
      });
    });
  }
};
