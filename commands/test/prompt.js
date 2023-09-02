const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  SlashCommandBuilder,
} = require("discord.js");
const { YESTERDAY, TODAY, BLOCKERS } = require("../../constants");

const replyWithModalWindow = async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId("myModal")
    .setTitle("Daily report");

  const yesterday = new TextInputBuilder()
    .setCustomId(YESTERDAY)
    .setLabel("What did I do yesterday")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const today = new TextInputBuilder()
    .setCustomId(TODAY)
    .setLabel("Plan for today")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const blockers = new TextInputBuilder()
    .setCustomId(BLOCKERS)
    .setLabel("Blockers")
    .setStyle(TextInputStyle.Paragraph);

  const firstActionRow = new ActionRowBuilder().addComponents(yesterday);
  const secondActionRow = new ActionRowBuilder().addComponents(today);
  const thirdActionRow = new ActionRowBuilder().addComponents(blockers);

  modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

  await interaction.showModal(modal);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("prompt")
    .setDescription("Replies with modal window"),
  async execute(interaction) {
    await replyWithModalWindow(interaction);
  },
};
