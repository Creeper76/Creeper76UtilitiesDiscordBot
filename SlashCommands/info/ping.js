const { Client, CommandInteraction, MessageEmbed } = require("discord.js");

module.exports = {
  name: "ping",
  description: "returns websocket ping",
  type: "CHAT_INPUT",

  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */
  run: async (client, interaction, args) => {
    if (interaction.channelId != client.config.cmdChannel) {
      const embed = new MessageEmbed()
        .setTitle("Error")
        .setDescription(`This is not a command channel!`)
        .setColor(client.config.embedColorError)
      return interaction.followUp({
        embeds: [embed],
      });
    }

    const embed = new MessageEmbed()
      .setTitle("Pong!")
      .setDescription(`Ping is ${client.ws.ping}ms`)
      .setColor(client.config.embedColorSuccess)
    interaction.followUp({ embeds: [embed] });
  },
};
