const { SlashCommandBuilder } = require("discord.js");
const console = require("../../logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    console.log("Pong !");
    return interaction.reply("Pong!");
  },
};
