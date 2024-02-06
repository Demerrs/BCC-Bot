const { ApplicationCommandOptionType, Client, Interaction, PermissionFlagsBits } = require('discord.js');
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

    const targetChannelId = interaction.options.get('channel').value;

    try {
      await interaction.deferReply();

      let suggestions = await Suggestions.findOne({ guildId: interaction.guild.id });

      if (suggestions) {
        if (suggestions.channelId === targetChannelId) {
          interaction.editReply('Channel has already been configured for suggestions. To disable run `/suggestions-disable`');
          return;
        }

        suggestions.channelId = targetChannelId;
      } else {
        suggestions = new Suggestions({
          guildId: interaction.guild.id,
          channelId: targetChannelId,
        });
      }

      await suggestions.save();
      interaction.editReply('Suggestions Channel has now been configured. To disable run `/suggestions-disable`');
    } catch (error) {
      console.log(error);
    }
  },

  name: 'suggestions-configure',
  description: 'Configure your suggestions channel for this server.',
  options: [
    {
      name: 'channel',
      description: 'The channel you want set up for suggestions.',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
