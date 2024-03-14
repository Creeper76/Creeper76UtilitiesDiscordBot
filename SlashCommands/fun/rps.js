const {
  CommandInteraction,
  Client,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  name: "rps",
  description: "Play rock-paper-scissors with the bot or another user",
  options: [
    {
      name: "amount",
      description: "The amount of coins to bet",
      type: "INTEGER",
      required: true,
    },
    {
      name: "user",
      description: "The user to play rock-paper-scissors with",
      type: "USER",
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
        .setColor(client.config.embedColorError);
      return interaction.followUp({
        embeds: [embed],
      });
    }
    // Load the coins data
    if (!fs.existsSync("./data")) {
      fs.mkdirSync("./data");
    }

    if (!fs.existsSync("./data/coins.json")) {
      fs.writeFileSync("./data/coins.json", JSON.stringify({}));
    }

    const coins = JSON.parse(fs.readFileSync("./data/coins.json", "utf-8"));

    if (!coins[interaction.user.id]) {
      coins[interaction.user.id] = {
        coins: 0,
      };
    }

    // Get the user and amount options
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    // If the user is not playing against another user
    if (!user) {
      // If the user didn't specify an amount
      if (!amount) {
        const embed = {
          title: "Error",
          description: "You need to specify an amount of coins to bet",
          color: client.config.embedColorError,
        };
        return interaction.followUp({ embeds: [embed] });
      }

      // If the user specified an amount
      if (amount < 1) {
        const embed = {
          title: "Error",
          description: "You need to bet at least 1 coin",
          color: client.config.embedColorError,
        };
        return interaction.followUp({ embeds: [embed] });
      }

      if (amount > coins[interaction.user.id]) {
        const embed = {
          title: "Error",
          description: "You do not have enough coins",
          color: client.config.embedColorError,
        };
        return interaction.followUp({ embeds: [embed] });
      }

      // Generate the bot's choice
      const choices = ["rock", "paper", "scissors"];
      const botChoice = choices[Math.floor(Math.random() * choices.length)];

      // Generate the user's choice
      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("rock")
          .setLabel("🪨")
          .setStyle("PRIMARY"),
        new MessageButton()
          .setCustomId("paper")
          .setLabel("📃")
          .setStyle("PRIMARY"),
        new MessageButton()
          .setCustomId("scissors")
          .setLabel("✂️")
          .setStyle("PRIMARY")
      );
      const embed = {
        title: "Rock-Paper-Scissors",
        description: "Choose your weapon.\nBet: " + amount + " coins",
        color: client.config.embedColor,
      };
      interaction.followUp({ embeds: [embed], components: [row] });

      // Create a filter for the collector
      const filter = (i) =>
        i.customId === "rock" ||
        i.customId === "paper" ||
        i.customId === "scissors";

      // Create a collector
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 15000,
      });

      collector.on("collect", (i) => {
        if (i.user.id !== interaction.user.id) {
          const embed = {
            title: "Error",
            description: "You cannot interact with this message",
            color: client.config.embedColorError,
          };
          return i.reply({ embeds: [embed], ephemeral: true });
        }

        const userChoice = i.customId;

        // Get the result
        let result;
        if (userChoice === botChoice) result = "It's a tie!";
        else if (
          (userChoice === "rock" && botChoice === "scissors") ||
          (userChoice === "paper" && botChoice === "rock") ||
          (userChoice === "scissors" && botChoice === "paper")
        ) {
          result = "You win!";
          coins[interaction.user.id].coins += amount;
        } else {
          result = "You lose!";
          coins[interaction.user.id].coins -= amount;
        }

        // Save the coins data
        fs.writeFileSync("./data/coins.json", JSON.stringify(coins, null, 2));

        // Send the result
        const embed = {
          title: "Rock-Paper-Scissors",
          description: `You chose ${userChoice}\nThe bot chose ${botChoice}\n${result}`,
          color: client.config.embedColorSuccess,
        };
        i.reply({ embeds: [embed] });

        // Stop the collector
        collector.stop();
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          const embed = {
            title: "Rock-Paper-Scissors",
            description: "You took too long to respond",
            color: client.config.embedColorError,
          };
          interaction.followUp({ embeds: [embed], components: [] });

          // Return the coins
          coins[interaction.user.id].coins += amount;
          fs.writeFileSync("./data/coins.json", JSON.stringify(coins, null, 2));

          return;
        }
      });
    } else {
      // If the user is playing against another user
      if (user.id === interaction.user.id) {
        const embed = {
          title: "Error",
          description: "You cannot play against yourself",
          color: client.config.embedColorError,
        };
        return interaction.followUp({ embeds: [embed] });
      }

      // If the user didn't specify an amount
      if (!amount) {
        const embed = {
          title: "Error",
          description: "You need to specify an amount of coins to bet",
          color: client.config.embedColorError,
        };
        return interaction.followUp({ embeds: [embed] });
      }

      // If the user specified an amount
      if (amount < 1) {
        const embed = {
          title: "Error",
          description: "You need to bet at least 1 coin",
          color: client.config.embedColorError,
        };
        return interaction.followUp({ embeds: [embed] });
      }

      if (amount > coins[interaction.user.id]) {
        const embed = {
          title: "Error",
          description: "You do not have enough coins",
          color: client.config.embedColorError,
        };
        return interaction.followUp({ embeds: [embed] });
      }

      if (!coins[user.id]) {
        coins[user.id] = 0;
      }

      // If the other user doesn't have enough coins
      if (amount > coins[user.id].coins) {
        const embed = {
          title: "Error",
          description: "The other user does not have enough coins",
          color: client.config.embedColorError,
        };
        return interaction.followUp({ embeds: [embed] });

        return;
      }

      // Ask the other user if they want to play
      const embed = {
        title: "Rock-Paper-Scissors",
        description: `<@${user.id}>, do you want to play rock-paper-scissors with <@${interaction.user.id}> for ${amount} coins?`,
        color: client.config.embedColorPending,
      };
      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("yes")
          .setLabel("Yes")
          .setStyle("SUCCESS"),
        new MessageButton().setCustomId("no").setLabel("No").setStyle("DANGER")
      );
      interaction.followUp({ embeds: [embed], components: [row] });

      // Create a filter for the collector
      const filter = (i) => i.customId === "yes" || i.customId === "no";

      // Create a collector
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 15000,
      });

      collector.on("collect", (i) => {
        if (i.user.id !== user.id) {
          const embed = {
            title: "Error",
            description: "You cannot interact with this message",
            color: client.config.embedColorError,
          };
          return i.reply({ embeds: [embed], ephemeral: true });
        } else if (i.customId === "no") {
          const embed = {
            title: "Rock-Paper-Scissors",
            description: `<@${user.id}> declined the game`,
            color: client.config.embedColorError,
          };
          i.reply({ embeds: [embed], components: [] });

          return;
        } else if (i.customId === "yes") {
          const embed = {
            title: "Rock-Paper-Scissors",
            description: `<@${user.id}> accepted the game!`,
            color: client.config.embedColorSuccess,
          };
          i.reply({ embeds: [embed], components: [] });

          // Stop the collector
          collector.stop();

          // Ask the users for their choices
          let player1Picked = "Not Picked";
          let player2Picked = "Not Picked";

          let userChoice;
          let userChoice2;

          // Create a single embed for both players
          const embedg = {
            title: "Rock-Paper-Scissors",
            description: `Choose your weapon.\nBet: ${amount} coins`,
            color: client.config.embedColorPending,
          };

          const rowg = new MessageActionRow().addComponents(
            new MessageButton()
              .setCustomId("rock")
              .setLabel("🪨")
              .setStyle("PRIMARY"),
            new MessageButton()
              .setCustomId("paper")
              .setLabel("📃")
              .setStyle("PRIMARY"),
            new MessageButton()
              .setCustomId("scissors")
              .setLabel("✂️")
              .setStyle("PRIMARY")
          );

          // Add slight delay to make message send in order
          setTimeout(() => {
            interaction.followUp({ embeds: [embedg], components: [rowg] });
          }, 10);

          // Create a filter for the collector
          const filterg = (i) =>
            i.customId === "rock" ||
            i.customId === "paper" ||
            i.customId === "scissors";

          // Create a collector
          const collectorg =
            interaction.channel.createMessageComponentCollector({
              filter: filterg,
              time: 15000,
            });

          collectorg.on("collect", (i) => {
            if (i.user.id === interaction.user.id) {
              player1Picked = "Picked";
              userChoice = i.customId;
              i.reply("Player 1 has picked an option!");
            } else if (i.user.id === user.id) {
              player2Picked = "Picked";
              userChoice2 = i.customId;
              i.reply("Player 2 has picked an option!");
            } else {
              const errorEmbed = {
                title: "Error",
                description: "You cannot interact with this message",
                color: client.config.embedColorError,
              };
              return i.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            // If both players picked
            if (player1Picked === "Picked" && player2Picked === "Picked") {
              collectorg.stop();

              // Get the result
              let result;

              if (userChoice === userChoice2) result = "It's a tie!";
              else if (
                (userChoice === "rock" && userChoice2 === "scissors") ||
                (userChoice === "paper" && userChoice2 === "rock") ||
                (userChoice === "scissors" && userChoice2 === "paper")
              ) {
                result = `<@${interaction.user.id}> wins!`;
                coins[interaction.user.id].coins += amount;
                coins[user.id].coins -= amount;
              } else {
                result = `<@${user.id}> wins!`;
                coins[interaction.user.id].coins -= amount;
                coins[user.id].coins += amount;
              }

              // Save the coins data
              fs.writeFileSync(
                "./data/coins.json",
                JSON.stringify(coins, null, 2)
              );

              // Send the result
              const embedr = {
                title: "Rock-Paper-Scissors",
                description: `<@${interaction.user.id}> chose ${userChoice}\n<@${user.id}> chose ${userChoice2}\n${result}`,
                color: client.config.embedColorSuccess,
              };
              // Add slight delay to make message send in order
              setTimeout(() => {
                interaction.followUp({ embeds: [embedr], components: [] });
              }, 10);

              return;
            }
          });

          collectorg.on("end", (collected) => {
            if (collected.size === 0) {
              const errorEmbed = {
                title: "Rock-Paper-Scissors",
                description: "Both players took too long to respond",
                color: client.config.embedColorError,
              };
              interaction.editReply({ embeds: [errorEmbed], components: [] });
            }
          });
        } else {
          const errorEmbed = {
            title: "Error",
            description: "An error occurred",
            color: client.config.embedColorError,
          };
          return i.reply({ embeds: [errorEmbed], ephemeral: true });
        }
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          const embed = {
            title: "Rock-Paper-Scissors",
            description: "The other user took too long to respond",
            color: client.config.embedColorError,
          };
          interaction.followUp({ embeds: [embed], components: [] });

          return;
        }
      });
    }
  },
};
