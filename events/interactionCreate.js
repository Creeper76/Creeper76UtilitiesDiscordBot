const client = require("../index");
const { MessageEmbed } = require("discord.js");
const fs = require("fs");

client.on("interactionCreate", async (interaction) => {
  // Slash Command Handling
  if (interaction.isCommand()) {
    await interaction.deferReply({ ephemeral: false }).catch(() => {});

    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd) return interaction.followUp({ content: "An error has occured " });

    const args = [];

    for (let option of interaction.options.data) {
      if (option.type === "SUB_COMMAND") {
        if (option.name) args.push(option.name);
        option.options?.forEach((x) => {
          if (x.value) args.push(x.value);
        });
      } else if (option.value) args.push(option.value);
    }
    interaction.member = interaction.guild.members.cache.get(
      interaction.user.id
    );

    cmd.run(client, interaction, args);

    // Check if the data folder exists
    if (!fs.existsSync("./data")) {
      fs.mkdirSync("./data");
    }

    // Create a json file with the user's coins if it doesn't exist
    if (!fs.existsSync("./data/coins.json")) {
      fs.writeFileSync("./data/coins.json", JSON.stringify({}));
    }

    // Read the json file
    client.coins = JSON.parse(fs.readFileSync("./data/coins.json", "utf8"));

    // Generate a random number between 1 and 15
    const randomNumber = Math.floor(Math.random() * 15) + 1;

    console.log(randomNumber);

    // If the random number is 15, give the user coins
    if (randomNumber === 15 && interaction.channelId === client.config.cmdChannel) {
      // Generate a random number of coins between 1 and 5
      const coins = Math.floor(Math.random() * 5) + 1;

      // Check if the user has a coin count in the json file
      if (!client.coins[interaction.user.id]) {
        client.coins[interaction.user.id] = {
          coins: 0,
        };
      }

      // Add the coins to the user's coin count and save the file
      client.coins[interaction.user.id].coins += coins;
      fs.writeFileSync(
        "./data/coins.json",
        JSON.stringify(client.coins, null, 2)
      );

      // Send a message to the user
      const embed = new MessageEmbed()
        .setTitle("Congratulations!")
        .setDescription(`🪙 You found ${coins} coins! You now have ${client.coins[interaction.user.id].coins}!`)
        .setColor(client.config.embedColorSuccess)
      interaction.channel.send({ embeds: [embed] });
    }
  }

  // Context Menu Handling
  if (interaction.isContextMenu()) {
    await interaction.deferReply({ ephemeral: false });
    const command = client.slashCommands.get(interaction.commandName);
    if (command) command.run(client, interaction);
  }
});
