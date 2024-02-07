const { 
    Client,
    Interaction,
    ActionRowBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ButtonBuilder, 
    ButtonStyle,
} = require('discord.js');

/**
 * 
 * @param {Client} client 
 * @param {Interaction} interaction 
 * @returns 
 */
module.exports = async (client, interaction) => {
    if (!interaction.isButton() || !interaction.customId) return;

    try {
        const [type] = interaction.customId.split('.');

        if (!type) return;

        if (type !== 'takeReport' && type !== 'abortReport' && type !== 'finishReport') return;

        if (type == 'takeReport') {
            const finish = new ButtonBuilder()
                .setCustomId('finishReport')
                .setLabel('Finish report')
                .setStyle(ButtonStyle.Success);

            const cancel = new ButtonBuilder()
                .setCustomId('abortReport')
                .setLabel('Abort report')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder()
                .addComponents(finish, cancel);

            await interaction.message.edit({ content: `Taken by: ${interaction.user.displayName}\n\n`, components: [row] });

            const userToMessage = await client.users.fetch(interaction.message.embeds[0].fields[1].value);

            await userToMessage.send(`**Your report is taken by: ${interaction.user.displayName}. 📌**\nIf additional information is needed, ${interaction.user.displayName} will write to you.`);

            await interaction.reply({ content: `You took the report.`, ephemeral: true });
            return;
        }

        if (type == 'abortReport') {
            const modal = new ModalBuilder({
                customId: `reportModalDecline-${interaction.user.id}`,
                title: 'Decline Report',

            });

            const reportContent = new TextInputBuilder({
                customId: 'reportContentDecline',
                label: `Enter your reason`,
                style: TextInputStyle.Paragraph
            });

            const firstActionRow = new ActionRowBuilder().addComponents(reportContent);

            modal.addComponents(firstActionRow);

            await interaction.showModal(modal);

            const filter = (interaction) => interaction.customId === `reportModalDecline-${interaction.user.id}`;

            const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 120_000 });

            const reportContentValue = modalInteraction.fields.getTextInputValue('reportContentDecline');

            await interaction.message.edit({ content: `Report was declined by: ${interaction.user.displayName}\nReason: ${reportContentValue}`, components: [] });

            const userToMessage = await client.users.fetch(interaction.message.embeds[0].fields[1].value);

            await userToMessage.send(`**Your report "${interaction.message.embeds[0].title}" was declined. ⚠️**\nReason: ${reportContentValue}`);

            await modalInteraction.reply({ content: `Report declined successfully.`, ephemeral: true });

            return;
        }

        if (type == 'finishReport') {
            const modal = new ModalBuilder({
                customId: `reportModalFinish-${interaction.user.id}`,
                title: 'Finish Report',
            });

            const reportContent = new TextInputBuilder({
                customId: 'reportContentFinish',
                label: `Enter your conclusion`,
                style: TextInputStyle.Paragraph
            });

            const firstActionRow = new ActionRowBuilder().addComponents(reportContent);

            modal.addComponents(firstActionRow);

            await interaction.showModal(modal);

            const filter = (interaction) => interaction.customId === `reportModalFinish-${interaction.user.id}`;

            const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 120_000 });

            const reportContentValue = modalInteraction.fields.getTextInputValue('reportContentFinish');

            await interaction.message.edit({ content: `Report was done by: ${interaction.user.displayName}\nConclusion: ${reportContentValue}`, components: [] });

            const userToMessage = await client.users.fetch(interaction.message.embeds[0].fields[1].value);

            await userToMessage.send(`**Your report "${interaction.message.embeds[0].title}" was done. ✅**\nConclusion: ${reportContentValue}`);

            await modalInteraction.reply({ content: `Report finished successfully.`, ephemeral: true });

            return;
        } else {
            await interaction.reply({ content: `Error.`, ephemeral: true });
            return;
        }

    } catch (error) {
        console.log(`The error appeared in buttons handling: ${error}`);
    }
}