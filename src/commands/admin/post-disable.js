const { Client, Interaction, PermissionFlagsBits } = require('discord.js');
const Posts = require('../../models/Posts');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    try {
      await interaction.deferReply();

      if (!(await Posts.exists({ guildId: interaction.guild.id }))) {
        interaction.editReply('Post Channel has not been configured for this server. Use `/autorole-configure` to set it up.');
        return;
      }

      await Posts.findOneAndDelete({ guildId: interaction.guild.id });
      interaction.editReply('Post Channel has been disabled for this server. Use `/autorole-configure` to set it up again.');
    } catch (error) {
      console.log(error);
    }
  },

  name: 'post-disable',
  description: 'Disable post channel in this server.',
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
};
