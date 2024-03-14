const { CommandInteraction, Client, MessageEmbed } = require("discord.js");
const fs = require("fs");

module.exports = {
  name: "setcmdchannel",
  description: "Set the channel where the bot will listen for commands",
  options: [
    {
      name: "channel",
      description: "The channel to set as the command channel",
      type: "CHANNEL",
      required: true,
    },
  ],

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const channel = interaction.options.getChannel("channel");
    const guild = interaction.guild;

    // Check for permissions
    if (
      !interaction.member.permissions.has("MANAGE_GUILD") |
      (!interaction.member.id == "777694273319469057")
    ) {
      const errorEmbed = {
        color: client.config.embedColorError,
        title: "Error",
        description:
          'You need the "Manage Server" permission to use this command',
      };
      return interaction.followUp({ embeds: [errorEmbed] });
    }

    if (!guild) {
      const errorEmbed = {
        color: client.config.embedColorError,
        title: "Error",
        description: "This command can only be used in a server",
      };
      return interaction.followUp({ embeds: [errorEmbed] });
    }

    if (channel.type !== "GUILD_TEXT") {
      const errorEmbed = {
        color: client.config.embedColorError,
        title: "Error",
        description: "The channel must be a text channel",
      };
      return interaction.followUp({ embeds: [errorEmbed] });
    }

    const data = {
      [guild.id]: {
        channelId: channel.id,
      },
    };

    fs.writeFileSync("./data/cmdChannel.json", JSON.stringify(data, null, 2));

    const successEmbed = {
      color: client.config.embedColorSuccess,
      title: "Success",
      description: `The command channel has been set to <#${channel.id}>`,
    };
    interaction.followUp({ embeds: [successEmbed] });

    client.config.cmdChannel = channel.id;
  },
};
