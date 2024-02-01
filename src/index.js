const fs = require('fs');
require('dotenv').config();
const {Client, Events, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, SlashCommandBuilder} = require('discord.js');
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

let monitoredChannels = [];
const monitoredChannelsFilePath = process.env.MONITOR_CHANNELS;


client.on(Events.ClientReady, async (x) => {
    client.user.setActivity("I'm soulless");
    monitoredChannels = loadMonitoredChannelsFromFile(monitoredChannelsFilePath);

    // Try catch to remove old unexisted commands
    try {
        // Fetch the current list of global commands
        const existingCommands = await client.application.commands.fetch();

        // Delete each existing command
        existingCommands.forEach(async (command) => {
            await command.delete();
        });

        console.log('Deleted old commands.');

    } catch (error) {
        console.error('Error fetching/deleting commands:', error);
    }
    //Creating commands

    const embed = new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Create embeded message')
    .addBooleanOption(option =>
        option
        .setName('use_everyone')
        .setDescription('Do you want to mention everyone?')
        .setRequired(true) 
    )
    .addStringOption(option =>
        option
        .setName('embeded_message')
        .setDescription('Set the message of announce')
        .setRequired(true),
    )
    .addChannelOption(option =>
        option
        .setName('set_channel')
        .setDescription('Specify the channel where you want to use message')
        .setRequired(false)
    )
    .addStringOption(option =>
        option
            .setName('color')
            .setDescription('Set the color for the embed message (hex format, e.g., #FF0000)')
            .setRequired(false)
    );

    for (let i = 1; i <= 6; i++) {
        const fieldName = `additional_field${i}`;
        embed.addStringOption(option =>
            option
            .setName(`${fieldName}`)
            .setDescription('Additional Field in the announce (new line)')    
            .setRequired(false)
        )
    }

    client.application.commands.create(embed);

    const say = new SlashCommandBuilder()
    .setName('say')
    .setDescription('Say something from the bot point of view')
    .addStringOption(option =>
        option
        .setName('say_something')
        .setDescription('text')
        .setRequired(true)
        )
    .addChannelOption(option =>
            option
            .setName('set_channel')
            .setDescription('Specify the channel where you want to use message')
            .setRequired(false)
    );

    client.application.commands.create(say);

    const moderation = new SlashCommandBuilder()
    .setName('moderation')
    .setDescription('Setup the moderation channels')
    .addChannelOption( option =>
        option
        .setName('set_channel')
        .setDescription('Channel')
        .setRequired(true)
    )

    client.application.commands.create(moderation);

    const logs = new SlashCommandBuilder()
    .setName('logs')
    .setDescription('Setup the log channel')
    .addChannelOption( option =>
        option
        .setName('set_channel')
        .setDescription('Channel')
        .setRequired(true)
    )

    client.application.commands.create(logs);


    console.log(`${x.user.tag} is ready!`);
})

client.on("interactionCreate", async (interaction) =>{
    const currentUser = interaction.user.tag;
    const currentUserImage = interaction.user.displayAvatarURL({ format: "png", dynamic: true });
    const channelAvatar = interaction.guild ? interaction.guild.iconURL({ format: "png", dynamic: true }) : null;

    if(!interaction.isChatInputCommand()) return;

    if(interaction.commandName === 'embed'){
        const userDesc = interaction.options.getString('embeded_message');
        const mentionChannel = interaction.options.getChannel('set_channel');
        const useEveryone = interaction.options.getBoolean('use_everyone');
        const mentionEveryoneString = useEveryone ? '@everyone ' : '';

        const fields = [];

        for (let i = 1; i <= 6; i++) {
            const fieldName = `additional_field${i}`;
            const fieldValue = interaction.options.getString(fieldName);
            
            if (fieldValue) {
                fields.push({
                    name: `News Nr.${i}`,
                    value: fieldValue,
                    inline: false,
                });
            }
        }

        const colorOption = interaction.options.getString('color');
        let color;

        // Validate color input (if provided) 
        if (colorOption) {
            if (!/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(colorOption)) {
                interaction.reply('Invalid color format. Please provide a valid hex color (e.g., #FF0000).');
                return;
            }
            color = parseInt(colorOption.slice(1), 16);
        } else {
            // Default color if not provided
            color = 0x206694;
        }

        const embed = new EmbedBuilder()
        .setTitle('News!')
        .setDescription(`${mentionEveryoneString} ${userDesc.toString()}.`)
        .setColor(color)
        .setThumbnail(channelAvatar)
        .setFooter({text: currentUser, iconURL: currentUserImage})
        .setTimestamp()
        .setImage('https://i.ibb.co/6s6S4GG/important.png');

        if (fields.length > 0) {
            embed.addFields(...fields);
        }

        if (mentionChannel) {
            mentionChannel.send({ embeds: [embed] })
                .then(() => {
                    // Respond to the interaction acknowledging that the message was sent
                    interaction.reply('Message sent successfully!');
                })
                .catch(error => {
                    console.error('Error sending message:', error);
                    // Respond to the interaction with an error message
                    interaction.reply('There was an error sending the message.');
                });
        } else {
            interaction.reply({ embeds: [embed] })
                .catch(error => {
                    console.error('Error replying with message:', error);
                    // Handle the error appropriately, such as logging it
                });
        }
        
    }

    if(interaction.commandName === 'say'){
        const mentionChannel = interaction.options.getChannel('set_channel');
        const userMessage = interaction.options.getString('say_something');

        if (mentionChannel) {
            mentionChannel.send(userMessage)
                .then(() => {
                    // Respond to the interaction acknowledging that the message was sent
                    interaction.reply('Message sent successfully!');
                })
                .catch(error => {
                    console.error('Error sending message:', error);
                    // Respond to the interaction with an error message
                    interaction.reply('There was an error sending the message.');
                });
        } else {
            interaction.reply(userMessage)
                .catch(error => {
                    console.error('Error replying with message:', error);
                    // Handle the error appropriately, such as logging it
                });
        }
    }

    if (interaction.commandName === 'moderation') {
        const channelToAdd = interaction.options.getChannel('set_channel');
        if (channelToAdd) {
            monitoredChannels.push(channelToAdd.id);
            interaction.reply(`Channel ${channelToAdd.name} added to monitored channels.`);

            // Save monitored channels to file
            saveMonitoredChannelsToFile(monitoredChannelsFilePath, monitoredChannels);
        } else {
            interaction.reply('Please specify a valid channel to add.');
        }
    }

    if (interaction.commandName === 'logs') {
        const channelToAdd = interaction.options.getChannel('set_channel');
        if (channelToAdd) {
            monitoredChannels.push(channelToAdd.id);
            interaction.reply(`Channel ${channelToAdd.name} added to monitored channels.`);

            // Save monitored channels to file
            saveMonitoredChannelsToFile(monitoredChannelsFilePath, monitoredChannels);
        } else {
            interaction.reply('Please specify a valid channel to add.');
        }
    }
})

function loadUncensoredWordsFromFile(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        // Assuming each line in the file contains one uncensored word
        const uncensoredWords = fileContent.split('\n').map(word => word.trim());
        return uncensoredWords;
    } catch (error) {
        console.error('Error reading uncensored words file:', error);
        return [];
    }
}

// Specify the path to the file containing uncensored words
const uncensoredWordsFilePath = process.env.CENSURED_WORDS; // Replace with your file path

// Load uncensored words from the file
const uncensoredWords = loadUncensoredWordsFromFile(uncensoredWordsFilePath);

function loadMonitoredChannelsFromFile(filePath) {
    try {
        // Read the file content if it exists
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // Assuming each line in the file contains one channel ID
        const channels = fileContent.split('\n').map(channel => channel.trim());
        return channels;
    } catch (error) {
        // Check if the error is due to the file not existing
        if (error.code === 'ENOENT') {
            // If the file doesn't exist, create an empty file
            fs.writeFileSync(filePath, '', 'utf8');
            return [];
        } else {
            // If there's another error, log it and return an empty array
            console.error('Error reading monitored channels file:', error);
            return [];
        } 
    }
}


// Function to save monitored channels to file
function saveMonitoredChannelsToFile(filePath, channels) {
    try {
        const channelsString = channels.join('\n');
        fs.writeFileSync(filePath, channelsString, 'utf8');
    } catch (error) {
        console.error('Error saving monitored channels to file:', error);
    }
}


// ...

client.on("messageCreate", async (message) => {
    // Check if the message is in a specific channel
    if (message.author.bot) {
        return;
    }

    const specificChannelId = '1201628228041851094'; // Replace with your specific channel ID
    const logChannelId = '1202622053077885009';
    if (!monitoredChannels.includes(message.channel.id)) {
        return; // Ignore messages from other channels
    }

    // Check for uncensored words
    const lowercaseContent = message.content.toLowerCase();

    for (const word of uncensoredWords) {
        if (lowercaseContent.includes(word.toLowerCase())) {
            try {
                // Perform action when uncensored word is found, e.g., delete the message

                const logChannel = await client.channels.fetch(logChannelId);
                await logChannel.send(`---------------------------------\nMessage deleted: ${message.content}\nAuthor: ${message.author.tag}\nChannel: ${message.channel.name}\n---------------------------------`);

                await message.reply('Please refrain from using uncensored words.');
                console.log(`Message deleted: ${message.content}`);
                await message.delete();
                // Optionally, you can also send a warning or reply to the user without referencing the deleted message
            } catch (error) {
                console.error('Error handling uncensored word:', error);
            }

            // Stop further processing since the word is found
            return;
        }
    }
});

// ...


client.login(process.env.TOKEN);