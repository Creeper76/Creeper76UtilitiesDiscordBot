const { Client, Collection } = require("discord.js");

const client = new Client({
    intents: 32767,
});
module.exports = client;

// Global Variables
client.commands = new Collection();
client.slashCommands = new Collection();
client.config = require("./config.json");

// Initializing the project
require("./handler")(client);

// Login to the bot
client.login(client.config.token);

// Run after logging in
client.once("ready", () => {
    // Set the bot's activity
    client.user.setActivity("Penguins :D", { type: "WATCHING" });
    // Create embed for DM
    const { MessageEmbed } = require("discord.js");
    const embed = new MessageEmbed()
        .setTitle("Bot Started")
        .setDescription("The bot has started successfully.\n\n**Bot Information**\n- Name: " + client.user.tag + "\n- ID: " + client.user.id + "\n- Bot Owner: " + client.users.cache.get(client.config.ownerID).tag + "\n\n**Server Information**\n- Server Count: " + client.guilds.cache.size + "\n- Member Count: " + client.guilds.cache.reduce((a, g) => a + g.memberCount, 0) + "\n\n**Channel Information**\n- Channel Count: " + client.channels.cache.size + "\n- Text Channel Count: " + client.channels.cache.filter((c) => c.type === "GUILD_TEXT").size + "\n- Voice Channel Count: " + client.channels.cache.filter((c) => c.type === "GUILD_VOICE").size + "\n\n**Invite Link**\n- [Invite the bot to your server](https://discord.com/oauth2/authorize?client_id=" + client.user.id + "&permissions=8&scope=bot)")
        .setColor(client.config.embedColorSuccess)
        .setTimestamp();
    // DM the owner that the bot is online
    client.users.cache
        .get(client.config.ownerID)
        .send({ embeds: [embed] });
    // Set the command channel
    const fs = require("fs");
    if (fs.existsSync("./data/cmdChannel.json")) {
        const data = JSON.parse(fs.readFileSync("./data/cmdChannel.json", "utf8"));
        client.config.cmdChannel = data[client.guilds.cache.first().id].channelId;
    }
});
