// Require the necessary discord.js classes
const { REST, Routes, Client, Collection, Events, GatewayIntentBits, SlashCommandBuilder, roleMention } = require('discord.js');
const { urlCheck, urlScanner, discordChecker } = require('./util');
const { token, client_id } = require('./config.json');

// vv ** BOILERPLATE ** DO NOT REMOVE ** vv

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

// ^^ ** BOILERPLATE ** DO NOT REMOVE ** ^^

const availableActions = {
    kick: 'kick'
}

let action = availableActions.kick;

const commands = [change_action, set_role];
client.commands = new Collection();

commands.forEach(c => {
    client.commands.set(c.data.name, c);
});

(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(client_id),
            { body: commands },
        )
    } catch (error) {
        console.log(error);
    }
});

const quarantine = (user) => {
    switch (action) {
        case availableActions.kick:
            user.kick('Spam/Phishing Violation');
            break;
    }
}

client.on(Events.MessageCreate, (m) => {
    // check for url presence
    // if url exists, urlTest = iterator of all urls in message
    //     otherwise, urlTest = false

    let urlTest = urlCheck(m.content);
    if (!urlTest) {
        return;
    }

    // check for url falsehood
    // if urls falsy,  urlScan = true
    // if urls truthy, urlScan = false

    let urlScan = urlScanner(urlTest);
    if (!urlScan) {
        return; // urls are clean
    }

    if (!discordChecker(urlTest)) {
        return;
    }

    m.delete();
    quarantine(m.member);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}`);
        console.error(error);
    }
});