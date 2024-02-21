const {
  ActionRowBuilder,
  ModalBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const { YESTERDAY, TODAY, BLOCKERS } = require("../../constants");
const { mongo } = require("../../mongoSetup");
const { getBeautifiedValues, modalFieldBuilder } = require("../../helpers");
const console = require("../../logger");

const replyWithModalWindow = async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  await mongo.connect().catch(() => {
    console.error("Failed connection to db");
    interaction.reply({
      content: "Failed connection to db",
    });
  });

  const db = await mongo.db("DailyBugle");

  const userName = interaction.user.username;

  console.log("Reply by ", userName);

  const [lastDocument] = await db
    .collection("reports")
    .find({ name: userName })
    .sort({ timestamp: -1 })
    .limit(1)
    .toArray();

  const {
    yesterday: yesterdayValue = [],
    today: todayValue = [],
    blockers: blockersValue = [],
  } = lastDocument || {};

  const beautifiedValues = getBeautifiedValues(
    [yesterdayValue, todayValue, blockersValue],
    true
  );

  const modal = new ModalBuilder()
    .setCustomId("myModal")
    .setTitle("Daily report");

  const textFields = [
    {
      value: beautifiedValues[0],
      id: YESTERDAY,
      label: "What did I do yesterday",
      required: true,
    },
    {
      value: beautifiedValues[1],
      id: TODAY,
      label: "Plan for today",
      required: true,
    },
    {
      value: beautifiedValues[2],
      id: BLOCKERS,
      label: "Blockers",
      required: false,
    },
  ];

  const components = [];

  for (let i = 0; i < textFields.length; i++) {
    components.push(
      new ActionRowBuilder().addComponents(modalFieldBuilder(textFields[i]))
    );
  }

  modal.addComponents(...components);

  await mongo.close();

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
