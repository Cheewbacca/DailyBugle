const { Events } = require("discord.js");
const { token } = require("./config.json");
const cron = require("cron");
const { client } = require("./discordSetup");
const { sendReminder } = require("./cron/sendReminder");
const { commonCommands } = require("./interactions/common");
const { submitPrompt } = require("./interactions/submitPrompt");
const { sendReports } = require("./cron/sendReports");

// discord bot is ready
client.once(Events.ClientReady, async () => {
  console.log("Ready!");
});

// Execute commands from commands folder
client.on(Events.InteractionCreate, commonCommands);

// on modal submit
client.on(Events.InteractionCreate, submitPrompt);

// Send reminder Monday-Friday at 12:00 (server time ?)
const notificationJob = new cron.CronJob("00 00 11 * * 1-5", sendReminder);
notificationJob.start();

// Send reports once per 2 weeks
const reportsJob = new cron.CronJob("00 00 12 * * 1", sendReports);
reportsJob.start();

// Start bot
client.login(token);
