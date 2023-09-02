const { client } = require("../discordSetup");
const { mongo } = require("../mongoSetup");

const sendReminder = async () => {
  await mongo.connect();

  const db = await mongo.db("DailyBugle");
  const users = await db.collection("users").find().toArray();
  const userIds = users.map((user) => user.id);

  await mongo.close();

  userIds.map((id) => {
    client.users.fetch(id, false).then((user) => {
      user.send("Reminder to send daily report");
    });
  });
};

module.exports = {
  sendReminder,
};
