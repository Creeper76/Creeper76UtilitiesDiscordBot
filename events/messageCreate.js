const client = require("../index");

client.on("messageCreate", async (message) => {
    /*if((message.channelId === "1176653891526475776") && (!message.content.toLowerCase().startsWith(client.config.prefix)) && (!message.author.bot)) {
        message.channel.send('I love Methamphetamine \:)');
    }*/
    if((message.content.toLocaleLowerCase().includes("meth")) && (!message.content.toLowerCase().startsWith(client.config.prefix)) && (!message.author.bot)) {
        message.react('🇲');
        message.react('🇪');
        message.react('🇹');
        message.react('🇭');
    }

    if (
        message.author.bot ||
        !message.guild ||
        !message.content.toLowerCase().startsWith(client.config.prefix)
    )
        return;

    const [cmd, ...args] = message.content
        .slice(client.config.prefix.length)
        .trim()
        .split(/ +/g);

    const command = client.commands.get(cmd.toLowerCase()) || client.commands.find(c => c.aliases?.includes(cmd.toLowerCase()));

    if (!command) return;
    await command.run(client, message, args);
});
