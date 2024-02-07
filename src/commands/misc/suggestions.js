const { 
    Client,
    Interaction,
    EmbedBuilder,
    ActionRowBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle,
} = require('discord.js');
const Suggestions = require('../../models/Suggestions');
const Cooldowns = require('../../models/Cooldowns');

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

        const suggestionsChannelId = await Suggestions.findOne({ guildId: interaction.guildId });

        if(!suggestionsChannelId || !suggestionsChannelId.channelId){
            interaction.reply({content: "Can't create suggestion. No suggestion channel configure for this server. Ask administration to set it up.", ephemeral: true});
            return;
        }

        const commandName = 'suggestion';
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        let cooldown = await Cooldowns.findOne({ commandName, userId, guildId });

        if(cooldown && Date.now() < cooldown.endsAt){
            const { default: prettyMs } = await import('pretty-ms');
      
            await interaction.reply({ content: `I'm sorry. You can't use this command. It's now on cooldown, time left: ${prettyMs(cooldown.endsAt - Date.now())}`, ephemeral: true});
            return;
        }
      
        if(!cooldown){
            cooldown = new Cooldowns({ commandName, userId, guildId });
        }

        const modal = new ModalBuilder({
            customId: `suggestionModal-${interaction.user.id}`,
            title: 'Suggestion',

        });

        const suggestionTitle = new TextInputBuilder({
            customId: 'suggestionTitle',
            label: `Suggestion title`,
            style: TextInputStyle.Short
        });

        const suggestionContent = new TextInputBuilder({
            customId: 'suggestionContent',
            label: `Enter your suggestion`,
            style: TextInputStyle.Paragraph
        });

        const firstActionRow = new ActionRowBuilder().addComponents(suggestionTitle);
        const secondActionRow = new ActionRowBuilder().addComponents(suggestionContent);

        modal.addComponents(firstActionRow, secondActionRow);

        await interaction.showModal(modal);

        //wait for modal to be submited
        const filter = (interaction) => interaction.customId ===  `suggestionModal-${interaction.user.id}`;

        cooldown.endsAt = Date.now() + 3600_000; // 3600_000 = 1h
        await cooldown.save();

        interaction.awaitModalSubmit({ filter, time: 600_000 })
        .then(async (modalInteraction) => {
            const suggestionTitleValue = modalInteraction.fields.getTextInputValue('suggestionTitle');
            const suggestionContentValue = modalInteraction.fields.getTextInputValue('suggestionContent');

            const emojis = ["👍", "👎"];

            const suggestionEmbed = new EmbedBuilder()
            .setTitle(suggestionTitleValue)
            .setDescription(suggestionContentValue)
            .setColor("Aqua");

            const suggestionMess = await client.channels.cache.get(suggestionsChannelId.channelId).send({ embeds: [suggestionEmbed] });

            for(let i = 1; i <= 2; i++){
                let emoji = emojis[i - 1];
    
                await suggestionMess.react(emoji);
            }

            modalInteraction.reply({content: `Suggestion sent successfully.`, ephemeral: true});
        })
        .catch((e) => {
            console.log(`Failed to submit modal: ${e}`);
        });
    },

    name: 'suggestion',
    description: 'Create a suggestion',
}