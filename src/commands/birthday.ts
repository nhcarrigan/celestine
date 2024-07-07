import { SlashCommandBuilder } from "discord.js";

import { Command } from "../interfaces/Command";
import { errorHandler } from "../utils/errorHandler";

/**
 * Validates that the day provided is a valid day of the month.
 *
 * @param {string} month The month to validate.
 * @param {number} day The day to validate.
 * @returns {boolean} True if the day is within the month's range.
 */
const validateDate = (month: string, day: number): boolean => {
  switch (month) {
    case "Jan":
    case "Mar":
    case "May":
    case "Jul":
    case "Aug":
    case "Oct":
    case "Dec":
      return day >= 1 && day <= 31;
    case "Feb":
      return day >= 1 && day <= 29;
    case "Apr":
    case "Jun":
    case "Sep":
    case "Nov":
      return day >= 1 && day <= 30;
    default:
      return false;
  }
};

export const bbset: Command = {
  data: new SlashCommandBuilder()
    .setName("bbset")
    .setDescription("Set your birthday!")
    .addStringOption((option) =>
      option
        .setName("month")
        .setDescription("Your Birth Month")
        .setRequired(true)
        .setChoices(
          {
            name: "January",
            value: "Jan"
          },
          {
            name: "February",
            value: "Feb"
          },
          {
            name: "March",
            value: "Mar"
          },
          {
            name: "April",
            value: "Apr"
          },
          {
            name: "May",
            value: "May"
          },
          {
            name: "June",
            value: "Jun"
          },
          {
            name: "July",
            value: "Jul"
          },
          {
            name: "August",
            value: "Aug"
          },
          {
            name: "September",
            value: "Sep"
          },
          {
            name: "October",
            value: "Oct"
          },
          {
            name: "November",
            value: "Nov"
          },
          {
            name: "December",
            value: "Dec"
          }
        )
    )
    .addIntegerOption((option) =>
      option
        .setName("day")
        .setDescription("Your Birth Day (1-31)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(31)
    ),
  run: async (bot, interaction) => {
    try {
      await interaction.deferReply();
      const month = interaction.options.getString("month", true);
      const day = interaction.options.getInteger("day", true);

      if (!validateDate(month, day)) {
        await interaction.editReply({
          content: `${month} ${day} is not a valid date!`
        });
        return;
      }

      await bot.db.birthdays.upsert({
        where: {
          serverId_userId: {
            serverId: interaction.guild.id,
            userId: interaction.user.id
          }
        },
        update: {
          birthday: new Date(`${month}-${day}-2000`)
        },
        create: {
          serverId: interaction.guild.id,
          userId: interaction.user.id,
          birthday: new Date(`${month}-${day}-2000`)
        }
      });

      await interaction.editReply(
        `Your birthday has been set to ${month}-${day}!`
      );
    } catch (err) {
      const id = await errorHandler(bot, "birthday command", err);
      await interaction.editReply({
        content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
      });
    }
  }
};
