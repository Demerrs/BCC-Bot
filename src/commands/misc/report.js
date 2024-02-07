const { 
    Client,
    Interaction,
    EmbedBuilder,
    ActionRowBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle,
    ButtonBuilder, 
    ButtonStyle,
} = require('discord.js');
const Reports = require('../../models/Reports');
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

        const commandName = 'report';
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const reportChannelId = await Reports.findOne({ guildId: interaction.guildId });

        if(!reportChannelId || !reportChannelId.channelId){
            interaction.reply({content: "Can't create report. No report channel configured for this server. Ask administration to set it up.", ephemeral: true});
            return;
        }

        //let cooldown = await Cooldowns.findOne({ commandName, userId, guildId });

        /*if(cooldown && Date.now() < cooldown.endsAt){
            const { default: prettyMs } = await import('pretty-ms');
      
            await interaction.reply({ content: `I'm sorry. You can't use this command. It's now on cooldown, time left: ${prettyMs(cooldown.endsAt - Date.now())}`, ephemeral: true});
            return;
        }
      
        if(!cooldown){
            cooldown = new Cooldowns({ commandName, userId, guildId });
        }*/

        const modal = new ModalBuilder({
            customId: `reportModal-${interaction.user.id}`,
            title: 'Report',

        });

        const reportTitle = new TextInputBuilder({
            customId: 'reportTitle',
            label: `Report title`,
            style: TextInputStyle.Short
        });

        const reportContent = new TextInputBuilder({
            customId: 'reportContent',
            label: `Enter your report`,
            style: TextInputStyle.Paragraph
        });

        const confirm = new ButtonBuilder()
        .setCustomId('takeReport')
        .setLabel('Take report')
        .setStyle(ButtonStyle.Primary);

        const cancel = new ButtonBuilder()
        .setCustomId('abortReport')
        .setLabel('Abort report')
        .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
		.addComponents(confirm, cancel);

        const firstActionRow = new ActionRowBuilder().addComponents(reportTitle);
        const secondActionRow = new ActionRowBuilder().addComponents(reportContent);

        modal.addComponents(firstActionRow, secondActionRow);

        await interaction.showModal(modal);

        //wait for modal to be submited
        const filter = (interaction) => interaction.customId ===  `reportModal-${interaction.user.id}`;

        interaction.awaitModalSubmit({ filter, time: 120_000 })
        .then(async (modalInteraction) => {
            const reportTitleValue = modalInteraction.fields.getTextInputValue('reportTitle');
            const reportContentValue = modalInteraction.fields.getTextInputValue('reportContent');

            const reportEmbed = new EmbedBuilder()
            .setTitle(reportTitleValue)
            .setDescription(reportContentValue)
            .setColor("DarkRed");
            
            reportEmbed.addFields({ name: 'Reporter Name: ', value: interaction.user.displayName });
            reportEmbed.addFields({ name: 'Reporter Id: ', value: interaction.user.id });

            const response = await client.channels.cache.get(reportChannelId.channelId).send({ embeds: [reportEmbed], components: [row] });

            //const user = await client.users.fetch(interaction.user.id);
            //user.send(`﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌\n**Your report "${reportTitleValue}"\nhas been submitted successfully.**\n\nPlease wait until your report will took someone.\nThank you for your feedback!❤\n﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌`);

            modalInteraction.reply({content: `Report sent successfully.`, ephemeral: true});

            /*cooldown.endsAt = Date.now() + 3600_000; // 3600_000 = 1h
            await cooldown.save();*/
        })
        .catch((e) => {
            console.log(`Failed to submit modal: ${e}`);
        });
    },

    name: 'report',
    description: 'Report a problem or exploiter.',
    devOnly: true,
}