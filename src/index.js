require('dotenv').config();
const {Client, Events, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, SlashCommandBuilder} = require('discord.js');
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

client.on(Events.ClientReady, (x) => {
    client.user.setActivity("I'm soulless");

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


    console.log(`${x.user.tag} is ready!`);
})

client.on("interactionCreate", (interaction) =>{
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
})

client.login(process.env.TOKEN);