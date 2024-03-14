const { CommandInteraction, Client, MessageEmbed } = require("discord.js");
const speedTest = require("speedtest-net");

speedTest({ acceptLicense: true, acceptGdpr: true }).then((speed) => {
  let embed = new MessageEmbed().addFields({
    name: "Internet Speed",
    value: `Download: ${speed.download.bandwidth} Upload: ${speed.upload.bandwidth}`,
    inline: true,
  });
});

module.exports = {
  name: "netstats",
  description: "Get the bot's network statistics",
  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async (client, interaction) => {
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
      .setTitle("Network Statistics")
      .setColor(client.config.embedColorSuccess)
      .addFields(
        {
          name: "Ping",
          value: `${client.ws.ping}ms`,
          inline: true,
        },
        {
          name: "Uptime",
          value: `${Math.floor(client.uptime / 1000 / 60)} minutes`,
          inline: true,
        },
        {
          name: "Memory Usage",
          value: `${Math.round(
            process.memoryUsage().heapUsed / 1024 / 1024
          )}MB`,
          inline: true,
        }
      );

    interaction.followUp({ embeds: [embed] });

    const speedTestEmbed = new MessageEmbed()
      .setDescription("Running speedtest...")
      .setColor(client.config.embedColorPending);

    let channel = interaction.channel;
    channel.send({ embeds: [speedTestEmbed] }).then((message) => {
      speedTest({ acceptLicense: true, acceptGdpr: true }).then((speed) => {
        let speedEmbed = new MessageEmbed()
          .setTitle("Internet Speed")
          .setColor(client.config.embedColorSuccess)
          .addFields(
            {
              name: "Download Speed",
              value: `${(speed.download.bandwidth / 1024 / 1024).toFixed(
                2
              )} Mbps`,
              inline: true,
            },
            {
              name: "Upload Speed",
              value: `${(speed.upload.bandwidth / 1024 / 1024).toFixed(
                2
              )} Mbps`,
              inline: true,
            },
            {
              name: "Ping",
              value: `${speed.ping.latency}`,
              inline: true,
            },
            {
              name: "ISP",
              value: `${speed.isp}`,
              inline: true,
            }
          );
        message.edit({ embeds: [speedEmbed] });
      });
    });
  },
};
