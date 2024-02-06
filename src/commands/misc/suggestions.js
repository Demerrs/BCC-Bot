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

        const suggestionsChannelId = await Suggestions.findOne({ guildId: interaction.guildId });

        interaction.awaitModalSubmit({ filter, time: 120_000 })
        .then(async (modalInteraction) => {
            const suggestionTitleValue = modalInteraction.fields.getTextInputValue('suggestionTitle');
            const suggestionContentValue = modalInteraction.fields.getTextInputValue('suggestionContent');

            if(!suggestionsChannelId || !suggestionsChannelId.channelId){
                interaction.reply({content: "Can't send suggestion. No post channel configure for this server. Set it up by `/post-configure`", ephemeral: true});
                return;
            }

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