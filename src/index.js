require('dotenv').config();
const {Client, Events, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, SlashCommandBuilder} = require('discord.js');
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

client.on(Events.ClientReady, (x) => {
    client.user.setActivity("I'm soulless");

    const announe = new SlashCommandBuilder()
	.setName('announce')
	.setDescription('Announce something!')
    .addStringOption(option =>
        option
        .setName('text')
        .setDescription('The text to announce')
        .setRequired(true)
        )
    .addUserOption(option => 
        option
        .setName('user')
        .setDescription('Person to mention')
        .setRequired(false)
        )
    
    client.application.commands.create(announe);

    const embed = new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Create embeded message');

    client.application.commands.create(embed);


    console.log(`${x.user.tag} is ready!`);
})

client.on("interactionCreate", (interaction) =>{
    if(!interaction.isChatInputCommand()) return;

    if(interaction.commandName === 'announce'){
        const userOption = interaction.options.getUser('user');
        const userText = interaction.options.getString('text');
        if(userText && userOption){
            interaction.reply(`${userText} ${userOption.toString()}!`);
        }else if(userText){
            interaction.reply(`${userText}!`);
        }else{
            interaction.reply('Enter a valid message!');
        }
    }

    if(interaction.commandName === 'embed'){
        const embed = new EmbedBuilder()
        .setTitle('News!')
        .setDescription('Embed message')
        .setColor(0x206694)
        .setFooter({text: 'Footer text'})
        .setTimestamp()
        .setImage('https://i.ibb.co/6s6S4GG/important.png')
        .addFields({
            name: 'Field1',
            value: 'Test text',
            inline: true
        },{
            name: 'Field2',
            value: 'Text fields 2',
            inline: true
        },{
            name: 'Field3',
            value: 'Text fields 3',
            inline: true
        },{
            name: 'Field4',
            value: 'Text fields 4',
            inline: true
        },{
            name: 'Field5',
            value: 'Text fields 5',
            inline: true
        })
        interaction.reply({embeds: [embed]});

    }
})

client.login(process.env.TOKEN);