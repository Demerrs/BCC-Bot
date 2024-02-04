require('dotenv').config();
const {
    Client, 
    Events, 
    GatewayIntentBits, 
    EmbedBuilder, 
    PermissionsBitField, 
    Permissions, 
    SlashCommandBuilder
} = require('discord.js');

const mongoose = require('mongoose');

const eventHandler = require('./handlers/eventHandler');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ],
});

(async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.DB_CONNECTION);
        console.log("Connected to DB.");


        eventHandler(client);

        client.login(process.env.TOKEN);
    } catch (error) {
        console.log(`Error when trying to connect to DB: ${error}`);
    }
})();