const { client } = require("../discordSetup");
const { mongo } = require("../mongoSetup");
const { channelId, BEAUTY_NAMES } = require("../config.json");
const { YESTERDAY, TODAY, BLOCKERS } = require("../constants");
const { getBeautifiedValues } = require("../helpers");
const console = require("../logger");

const submitPrompt = async (interaction) => {
  if (!interaction.isModalSubmit()) {
    return;
  }

  const userName = interaction.user.username;
  const userId = interaction.user.id;

  const { fields } = interaction.fields;

  if (!fields instanceof Map || !userName || !userId) {
    console.error("Bad request");
    interaction.reply({
      content: "Bad request",
    });

    return;
  }

  // keys from form
  const mappedKeys = [YESTERDAY, TODAY, BLOCKERS];

  // split value by enter pressing
  const valuesAsArrays = mappedKeys.map(
    (key) => fields.get(key)?.value?.split("\n") || []
  );

  if (valuesAsArrays.length !== 3) {
    console.error("Missing required fields");
    interaction.reply({
      content: "Missing required fields",
    });

    return;
  }

  // prepare values to show
  const beautifiedValues = getBeautifiedValues(valuesAsArrays);

  const prettyMsg = `Report from ${BEAUTY_NAMES[userName] || userName}: \`\`\`md
-- What did I do yesterday:
   ${beautifiedValues[0]}\n
-- Plan for today:
   ${beautifiedValues[1]}\n
-- Blockers:
   ${beautifiedValues[2]}\`\`\``;

  await mongo.connect().catch(() => {
    console.error("Failed connection to db");
    interaction.reply({
      content: "Failed connection to db",
    });
  });

  const db = await mongo.db("DailyBugle");

  const users = await db.collection("users");

  const userFromDb = await users.find({ id: userId }).toArray();

  // add user to collection if new
  if (!userFromDb.length) {
    console.log("Added user ", userId);
    users.insertOne({ id: userId });
  }

  const reports = await db.collection("reports");

  // values from form with keys and value
  const formValues = mappedKeys.reduce(
    (acc, key, index) => ({
      ...acc,
      [key]: valuesAsArrays[index],
    }),
    {}
  );

  reports
    .insertOne({
      name: userName,
      ...formValues,
      timestamp: new Date().getTime(),
    })
    .then(() => {
      client.channels.fetch(channelId).then((channel) => {
        console.log(channelId, " pushed message");
        channel.send(prettyMsg);
      });
    })
    .then(() => {
      console.log("Submission was received successfully!");
      interaction.reply({
        content: "Your submission was received successfully!",
      });
    })
    .catch(() => {
      console.error("Submission errored!");
      interaction.reply({
        content: "Something went wrong!",
      });
    })
    .finally(() => {
      mongo.close();
    });
};

module.exports = {
  submitPrompt,
};
