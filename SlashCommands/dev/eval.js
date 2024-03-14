const { CommandInteraction, Permissions } = require("discord.js");
const { inspect } = require("util");
module.exports = {
  name: "eval",
  description: "Evauluate code",
  options: [
    {
      name: "code",
      description: "code to evaluate",
      type: "STRING",
      required: true,
    },
  ],

  /**
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {String[]} args
   */
  run: async (client, interaction, args) => {
    const error2Embed = {
      color: client.config.embedColorError,
      title: "Error",
      description: "Missing Permissions",
    };
    if (
      !interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS) ||
      !interaction.member.id == "777694273319469057"
    ) {
      //https://replit.com/talk/learn/Discord-Permissions-List-Array-form/35372
      interaction.followUp({ embeds: [error2Embed] });
      return;
    }

    code = interaction.options.getString("code");
    const otherErrorEmbed = {
      color: client.config.embedColorError,
      title: "Error",
      description: "Please provide valid code to evaluate.",
    };
    if (!code) return interaction.followUp({ embeds: [otherErrorEmbed] });

    const evaluating = {
      color: client.config.embedColorPending,
      title: "Evaluating",
      description: "```js\n" + code + "```",
    };
    interaction.followUp({ embeds: [evaluating] });
    const startTime = Date.now();

    try {
      if (
        code.includes("client.token") ||
        code.includes("client.config") ||
        code.includes("client.config.token") ||
        code.includes("client.config.prefix") ||
        code.includes("client.config.embedColorError") ||
        code.includes("client.config.embedColorSuccess") ||
        code.includes("client.config.embedColorPending") ||
        code.includes("client.config.cmdChannel") ||
        code.includes("client.config.ownerID")
      ) {
        code = "'[NO TOKEN FOR YOU]'";
      } else if (code.toLowerCase() === "penguin_test") {
        //Used to test embeds without having to type it
        code =
          "const penguin = {color:0xFFCCCC,title: 'Penguin',description: 'Funny',};interaction.channel.send({ embeds: [penguin] })";
      } else if (code.toLowerCase() === "cutie") { // ? I forgot that I made this 💀
        code =
          "interaction.channel.send('https://cdn.discordapp.com/attachments/1147711629010665582/1175249816566108210/AnimeC.png?ex=656a8baf&is=655816af&hm=88e46ec1bab5d58e4e7dccf048b63512bcd2253df0c77a9a35f9661205cd0155&')";
      }
      const result = await eval(code);
      const timeElapsed = Date.now() - startTime;
      let output = result;
      if (typeof result !== "string") {
        output = inspect(result);
      }

      if (
        output.includes(client.token.toLowerCase()) ||
        output.includes(client.token.toUpperCase()) ||
        output.includes(client.token) ||
        output.includes(client.config)
      ) {
        output = "[NO TOKEN FOR YOU]";
      } else if (output.includes("Message {")) {
        output = "Sent Message";
      }

      const codeEmbed = {
        color: client.config.embedColorSuccess,
        title: "Evaluated Code",
        description: "```js\n" + output + "```",
        footer: {
          text: "Time Elapsed: " + timeElapsed + "ms",
        },
      };

      interaction.channel.send({ embeds: [codeEmbed] });
    } catch (error) {
      console.log(error);
      const timeElapsed = Date.now() - startTime;
      const errorEmbed = {
        color: client.config.embedColorError,
        title: "Error",
        description: "" + error,
        footer: {
          text: "Time Elapsed: " + timeElapsed + "ms",
        },
      };

      interaction.channel.send({ embeds: [errorEmbed] });
    }
  },
};
