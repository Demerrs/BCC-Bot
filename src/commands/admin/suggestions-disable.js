const { Client, Interaction, PermissionFlagsBits } = require('discord.js');
const Suggestions = require('../../models/Suggestions');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    try {
      await interaction.deferReply();

      if (!(await Suggestions.exists({ guildId: interaction.guild.id }))) {
        interaction.editReply('Suggestions Channel has not been configured for this server. Use `/suggestions-configure` to set it up.');
        return;
      }

      await Suggestions.findOneAndDelete({ guildId: interaction.guild.id });
      interaction.editReply('Suggestions Channel has been disabled for this server. Use `/suggestions-configure` to set it up again.');
    } catch (error) {
      console.log(error);
    }
  },

  name: 'suggestions-disable',
  description: 'Disable suggestions channel in this server.',
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
};
