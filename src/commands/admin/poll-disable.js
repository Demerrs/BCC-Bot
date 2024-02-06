const { Client, Interaction, PermissionFlagsBits } = require('discord.js');
const Poll = require('../../models/Poll');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    try {
      await interaction.deferReply();

      if (!(await Poll.exists({ guildId: interaction.guild.id }))) {
        interaction.editReply('Polls Channel has not been configured for this server. Use `/poll-configure` to set it up.');
        return;
      }

      await Poll.findOneAndDelete({ guildId: interaction.guild.id });
      interaction.editReply('Polls Channel has been disabled for this server. Use `/poll-configure` to set it up again.');
    } catch (error) {
      console.log(error);
    }
  },

  name: 'poll-disable',
  description: 'Disable polls channel in this server.',
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
};
