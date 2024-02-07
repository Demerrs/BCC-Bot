const { Client, Interaction, PermissionFlagsBits } = require('discord.js');
const Reports = require('../../models/Reports');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    try {
      await interaction.deferReply();

      if (!(await Reports.exists({ guildId: interaction.guild.id }))) {
        interaction.editReply('Reports Channel has not been configured for this server. Use `/report-configure` to set it up.');
        return;
      }

      await Reports.findOneAndDelete({ guildId: interaction.guild.id });
      interaction.editReply('Reports Channel has been disabled for this server. Use `/report-configure` to set it up again.');
    } catch (error) {
      console.log(error);
    }
  },

  name: 'report-disable',
  description: 'Disable reports channel in this server.',
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
};
