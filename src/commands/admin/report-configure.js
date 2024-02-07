const { ApplicationCommandOptionType, Client, Interaction, PermissionFlagsBits } = require('discord.js');
const Reports = require('../../models/Reports');

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

    const targetChannelId = interaction.options.get('channel').value;

    try {
      await interaction.deferReply();

      let reports = await Reports.findOne({ guildId: interaction.guild.id });

      if (reports) {
        if (reports.channelId === targetChannelId) {
          interaction.editReply('Channel has already been configured for reports. To disable run `/report-disable`');
          return;
        }

        reports.channelId = targetChannelId;
      } else {
        reports = new Reports({
          guildId: interaction.guild.id,
          channelId: targetChannelId,
        });
      }

      await reports.save();
      interaction.editReply('Reports Channel has now been configured. To disable run `/report-disable`');
    } catch (error) {
      console.log(error);
    }
  },

  name: 'report-configure',
  description: 'Configure your report channel for this server.',
  options: [
    {
      name: 'channel',
      description: 'The channel you want set up for reports.',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
