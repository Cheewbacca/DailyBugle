const { client } = require("../discordSetup");
const { mongo } = require("../mongoSetup");
const console = require("../logger");

const sendReminder = async () => {
  await mongo.connect();

  const db = await mongo.db("DailyBugle");
  const users = await db.collection("users").find().toArray();
  const userIds = users.map((user) => user.id);

  await mongo.close();

  userIds.map((id) => {
    client.users.fetch(id, false).then((user) => {
      console.log(id, " received reminder");
      user.send("Reminder to send daily report");
    });
  });
};

module.exports = {
  sendReminder,
};
