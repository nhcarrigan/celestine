import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  Message,
  ModalSubmitInteraction
} from "discord.js";

import { ExtendedClient } from "../../interfaces/ExtendedClient";
import { errorHandler } from "../../utils/errorHandler";
import { getConfig } from "../data/getConfig";

/**
 * Handles the submission of the mass ban form.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {ModalSubmitInteraction} interaction The interaction payload from Discord.
 */
export const handleMassBanModal = async (
  bot: ExtendedClient,
  interaction: ModalSubmitInteraction
) => {
  try {
    await interaction.deferReply({ ephemeral: true });
    const { guild } = interaction;
    if (!guild) {
      await interaction.editReply({
        content: "This command can only be used in a guild."
      });
      return;
    }

    const rawBanList = interaction.fields.getTextInputValue("mass-ban-ids");
    const banList = rawBanList.trim().split(/\b/g);

    const reason = interaction.fields.getTextInputValue("reason");

    const embed = new EmbedBuilder();
    embed.setTitle("Confirm Mass Ban of Following IDs:");
    embed.setDescription(banList.join("\n"));
    embed.addFields({
      name: "Reason",
      value: reason
    });

    const yes = new ButtonBuilder()
      .setCustomId("confirm")
      .setLabel("Confirm")
      .setStyle(ButtonStyle.Success);
    const no = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(yes, no);
    const response = (await interaction.editReply({
      embeds: [embed],
      components: [row]
    })) as Message;

    const collector =
      response.createMessageComponentCollector<ComponentType.Button>({
        filter: (click) => click.user.id === interaction.user.id,
        time: 10000,
        max: 1
      });

    collector.on("end", async (clicks) => {
      const choice = clicks.first()?.customId;
      if (!clicks || clicks.size <= 0 || !choice) {
        await interaction.editReply({
          content: "This command has timed out.",
          embeds: [],
          components: []
        });
        return;
      }

      if (choice === "confirm") {
        for (const id of banList) {
          await guild.bans.create(id, {
            reason: `Massban by ${interaction.user.tag} for: ${reason}`,
            deleteMessageSeconds: 86400
          });
        }

        const config = await getConfig(bot, guild.id);
        if (!config.modLogChannel) {
          return;
        }
        const channel =
          guild.channels.cache.get(config.modLogChannel) ||
          (await guild.channels.fetch(config.modLogChannel));

        if (!channel || !("send" in channel)) {
          return;
        }

        embed.setTitle("Mass Ban:");
        embed.setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL()
        });
        await channel.send({ embeds: [embed] });
        await interaction.editReply({
          content: "Mass ban complete.",
          embeds: [],
          components: []
        });
      }

      if (choice === "cancel") {
        interaction.editReply({
          content: "Mass ban cancelled.",
          embeds: [],
          components: []
        });
      }
    });
  } catch (err) {
    const id = await errorHandler(bot, "handle mass ban modal", err);
    await interaction.editReply({
      content: `Something went wrong. Please [join our support server](https://chat.naomi.lgbt) and provide this ID: \`${id}\``
    });
  }
};
