import { SlashCommandBuilder } from "discord.js";

import { Command } from "../interfaces/Command";
import {
  validateColour,
  validateImage
} from "../modules/commands/profileValidation";
import { errorHandler } from "../utils/errorHandler";

export const profile: Command = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Edit your profile that appears in the leaderboard")
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("avatar")
        .setDescription(
          "The avatar to appear on your profile card must be a URL that points to an image."
        )
    )
    .addStringOption((option) =>
      option
        .setName("background-colour")
        .setDescription(
          "The semi-transparent background color for your profile card must be a 6-digit hex value."
        )
    )
    .addStringOption((option) =>
      option
        .setName("background-image")
        .setDescription(
          "The background image for your profile card must be a URL that points to an image."
        )
    )
    .addStringOption((option) =>
      option
        .setName("colour")
        .setDescription(
          "The color for the text on your profile card must be a 6-digit hex value."
        )
    ),
  run: async (CamperChan, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });

      const responses = ["Your profile settings have been updated!"];
      const opts = {
        avatar: interaction.options.getString("avatar"),
        backgroundColour: interaction.options.getString("background-colour"),
        backgroundImage: interaction.options.getString("background-image"),
        colour: interaction.options.getString("colour")
      };
      if (opts.avatar) {
        const isValid = await validateImage(opts.avatar);
        if (!isValid) {
          responses.push(`${opts.avatar} is not a valid image URL.`);
          opts.avatar = "";
        }
      }
      if (opts.backgroundImage) {
        const isValid = await validateImage(opts.backgroundImage);
        if (!isValid) {
          responses.push(`${opts.backgroundImage} is not a valid image URL.`);
          opts.backgroundImage = "";
        }
      }
      if (opts.colour) {
        if (opts.colour.startsWith("#")) {
          opts.colour = opts.colour.slice(1);
        }
        if (!validateColour(opts.colour)) {
          opts.colour = null;
          responses.push(
            `${interaction.options.getString("colour")} is not a valid hex code. Please try again with a 6 character hex code (# is optional).`
          );
        }
      }
      if (opts.backgroundColour) {
        if (opts.backgroundColour.startsWith("#")) {
          opts.backgroundColour = opts.backgroundColour.slice(1);
        }
        if (!validateColour(opts.backgroundColour)) {
          opts.backgroundColour = null;
          responses.push(
            `${interaction.options.getString("background-colour")} is not a valid hex code. Please try again with a 6 character hex code (# is optional).`
          );
        }
      }

      const query = (
        Object.entries(opts) as [keyof typeof opts, string][]
      ).reduce(
        (acc, [key, val]) => {
          if (val) {
            acc[key] = val;
          }
          return acc;
        },
        {} as Record<keyof typeof opts, string>
      );

      await CamperChan.db.levels.upsert({
        where: {
          serverId_userId: {
            serverId: interaction.guild.id,
            userId: interaction.user.id
          }
        },
        update: {
          ...query
        },
        create: {
          userId: interaction.user.id,
          serverId: interaction.guild.id,
          username: interaction.user.username,
          ...query
        }
      });

      await interaction.editReply({ content: responses.join("\n") });
    } catch (err) {
      const id = await errorHandler(CamperChan, "user settings command", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
