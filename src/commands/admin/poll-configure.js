const { ApplicationCommandOptionType, Client, Interaction, PermissionFlagsBits } = require('discord.js');
const Poll = require('../../models/Poll');

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

      let poll = await Poll.findOne({ guildId: interaction.guild.id });

      if (poll) {
        if (poll.channelId === targetChannelId) {
          interaction.editReply('Channel has already been configured for polls. To disable run `/poll-disable`');
          return;
        }

        poll.channelId = targetChannelId;
      } else {
        poll = new Poll({
          guildId: interaction.guild.id,
          channelId: targetChannelId,
        });
      }

      await poll.save();
      interaction.editReply('Polls Channel has now been configured. To disable run `/poll-disable`');
    } catch (error) {
      console.log(error);
    }
  },

  name: 'poll-configure',
  description: 'Configure your poll channel for this server.',
  options: [
    {
      name: 'channel',
      description: 'The channel you want set up for polls.',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
