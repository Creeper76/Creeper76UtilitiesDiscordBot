const { CommandInteraction, Client, MessageEmbed } = require("discord.js");
const fs = require("fs");

module.exports = {
  // The name and description of the command
  name: "snowball",
  description: "Throw a snowball at someone!",
  options: [
    {
      name: "throw",
      description: "Throw a snowball at a user",
      type: "SUB_COMMAND",
      options: [
        {
          name: "user",
          description: "The user to throw a snowball at",
          type: "USER",
          required: true,
        },
      ],
    },
    {
      name: "score",
      description: "Get your snowball score",
      type: "SUB_COMMAND",
    },
    {
      name: "leaderboard",
      description: "Get the snowball leaderboard",
      type: "SUB_COMMAND",
    },
  ],

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

    const subcommand = interaction.options.getSubcommand();

    // Check if the data folder exists
    if (!fs.existsSync("./data")) {
      fs.mkdirSync("./data");
    }

    // Create a json file with the user's scores if it doesn't exist
    if (!fs.existsSync("./data/scores.json")) {
      fs.writeFileSync("./data/scores.json", JSON.stringify({}));
    }

    // Read the json file
    client.scores = JSON.parse(fs.readFileSync("./data/scores.json", "utf8"));

    if (subcommand === "throw") {
      // Get the user
      const user = interaction.options.getUser("user");

      // Check if the user is a bot
      if (user.bot) {
        const embed = new MessageEmbed()
          .setColor(client.config.embedColorError)
          .setDescription("You cannot throw a snowball at a bot!");
        return interaction.followUp({ embeds: [embed] });
      }

      // Check if the user is the same as the author
      if (user.id === interaction.user.id) {
        const embed = new MessageEmbed()
          .setColor(client.config.embedColorError)
          .setDescription("You cannot throw a snowball at yourself!");
        return interaction.followUp({ embeds: [embed] });
      }

      // Check if the user has a score in the json file
      if (!client.scores[interaction.user.id]) {
        client.scores[interaction.user.id] = {
          snowballs: 0,
        };
      }

      // Increment the user's snowballs by 1 and save the file
      client.scores[interaction.user.id].snowballs += 1;
      fs.writeFileSync(
        "./data/scores.json",
        JSON.stringify(client.scores, null, 2)
      );

      // Print the user's snowballs
      console.log(client.scores[interaction.user.id].snowballs);

      // Send the snowball embed
      const embed = new MessageEmbed()
        .setColor(client.config.embedColorSuccess)
        .setDescription(`${interaction.user} threw a snowball at ${user}!`);
      interaction.followUp({ embeds: [embed] });
    } else if (subcommand === "score") {
      // Get the user's snowballs
      const snowballs = client.scores[interaction.user.id].snowballs;

      // Send the user's snowballs
      const embed = new MessageEmbed()
        .setColor(client.config.embedColorSuccess)
        .setDescription(`You have ${snowballs} snowballs!`);
      interaction.followUp({ embeds: [embed] });
    } else if (subcommand === "leaderboard") {
      // Sort the users by their snowballs
      const sorted = Object.entries(client.scores).sort(
        (a, b) => b[1].snowballs - a[1].snowballs
      );

      // Calculate total snowballs
      const totalSnowballs = sorted.reduce(
        (total, value) => total + value[1].snowballs,
        0
      );

      // Create a leaderboard
      let leaderboard =
        `☃️ Total Snowballs: ${totalSnowballs}\n\n` +
        sorted
          .map(
            (value, index) =>
              `${index + 1}. <@${value[0]}> - ${value[1].snowballs} snowballs`
          )
          .join("\n");

      // Limit the leaderboard to 10 users
      if (leaderboard.length > 2048) {
        leaderboard = leaderboard.substring(0, 2040) + "...";
      }

      // Send the leaderboard
      const embed = new MessageEmbed()
        .setColor(client.config.embedColorSuccess)
        .setTitle("Snowball Leaderboard")
        .setDescription(leaderboard);
      interaction.followUp({ embeds: [embed] });
    }
  },
};
