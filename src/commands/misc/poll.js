const { 
    Client,
    Interaction,
    ApplicationCommandOptionType,
    EmbedBuilder,
    PermissionFlagsBits
} = require('discord.js');
const Poll = require('../../models/Poll');

module.exports = {

    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */
    callback: async (client, interaction) => {

        if (!interaction.inGuild()) {
            interaction.reply('You can only run this command inside a server.');
            return;
        }

        const pollChannelId = await Poll.findOne({ guildId: interaction.guildId });

        if(!pollChannelId || !pollChannelId.channelId){
            interaction.reply({content: "Can't send poll. No poll channel configure for this server. Set it up by `/poll-configure`", ephemeral: true});
            return;
        }

        const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
        let pollEmbed = new EmbedBuilder();
        pollEmbed.setTitle(`${interaction.options.get('question').value}`);
        pollEmbed.setColor("Green");
        let optionsNum = [];
        for(let i = 1; i <= 10; i++){
            if(interaction.options.get(`answer-${i}`)?.value){
                optionsNum.push(i);
            }
        }

        for(let i = 1; i <= optionsNum.length; i++){
            let emoji = emojis[i - 1];
            let option = interaction.options.get(`answer-${optionsNum[i-1]}`)?.value;

            pollEmbed.addFields({
                name: `${emoji} ${option}`, value: '  '
            });
        }

        const pollMess = await client.channels.cache.get(pollChannelId.channelId).send({ embeds: [pollEmbed] });

        for(let i = 1; i <= optionsNum.length; i++){
            let emoji = emojis[i - 1];

            await pollMess.react(emoji);
        }
        

        await interaction.reply({ content: "Your poll has been sent.", ephemeral: true });


    },

    name: 'poll',
    description: 'Create a poll',
    options: [
        {
          name: 'question',
          description: 'The poll question.',
          type: ApplicationCommandOptionType.String,
          required: true
        },
        {
            name: 'answer-1',
            description: 'The poll answer.',
            type: ApplicationCommandOptionType.String,
            required: true
          },
          {
            name: 'answer-2',
            description: 'The poll answer.',
            type: ApplicationCommandOptionType.String,
            required: true
          },
          {
            name: 'answer-3',
            description: 'The poll answer.',
            type: ApplicationCommandOptionType.String,
          },
          {
            name: 'answer-4',
            description: 'The poll answer.',
            type: ApplicationCommandOptionType.String,
          },
          {
            name: 'answer-5',
            description: 'The poll answer.',
            type: ApplicationCommandOptionType.String,
          },
          {
            name: 'answer-6',
            description: 'The poll answer.',
            type: ApplicationCommandOptionType.String,
          },
          {
            name: 'answer-7',
            description: 'The poll answer.',
            type: ApplicationCommandOptionType.String,
          },
          {
            name: 'answer-8',
            description: 'The poll answer.',
            type: ApplicationCommandOptionType.String,
          },
          {
            name: 'answer-9',
            description: 'The poll answer.',
            type: ApplicationCommandOptionType.String,
          },
          {
            name: 'answer-10',
            description: 'The poll answer.',
            type: ApplicationCommandOptionType.String,
          },
      ],
    permissionsRequired: [PermissionFlagsBits.ManageChannels],
    botPermissions: [PermissionFlagsBits.ManageChannels],
}