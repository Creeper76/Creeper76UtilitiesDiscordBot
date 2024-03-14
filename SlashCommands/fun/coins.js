const { CommandInteraction, Client, MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'coins',
  description: 'Get the amount of coins you have',
  type: 'CHAT_INPUT',

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */

  run: async (client, interaction, args) => {
    if (interaction.channelId != client.config.cmdChannel) {
      const embed = new MessageEmbed()
        .setTitle('Error')
        .setDescription(`This is not a command channel!`)
        .setColor(client.config.embedColorError)
      return interaction.followUp({
        embeds: [embed],
      });
    }

    if (!fs.existsSync('./data')) {
      fs.mkdirSync('./data');
    }

    if (!fs.existsSync('./data/coins.json')) {
      fs.writeFileSync('./data/coins.json', JSON.stringify({}));
    }

    const coins = JSON.parse(fs.readFileSync('./data/coins.json', 'utf-8'));

    if (!coins[interaction.user.id]) {
      coins[interaction.user.id] = {
        coins: 0
      }
    }

    const embed = new MessageEmbed()
      .setTitle('Coins')
      .setDescription(`You have ${coins[interaction.user.id].coins} coins`)
      .setColor(client.config.embedColorSuccess)
    interaction.followUp({ embeds: [embed] });
  }
};