const { ApplicationCommandOptionType, Client, Interaction, PermissionFlagsBits } = require('discord.js');
const Posts = require('../../models/Posts');

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

      let posts = await Posts.findOne({ guildId: interaction.guild.id });

      if (posts) {
        if (posts.channelId === targetChannelId) {
          interaction.editReply('Channel has already been configured for posts. To disable run `/post-disable`');
          return;
        }

        posts.channelId = targetChannelId;
      } else {
        posts = new Posts({
          guildId: interaction.guild.id,
          channelId: targetChannelId,
        });
      }

      await posts.save();
      interaction.editReply('Post Channel has now been configured. To disable run `/post-disable`');
    } catch (error) {
      console.log(error);
    }
  },

  name: 'post-configure',
  description: 'Configure your post channel for this server.',
  options: [
    {
      name: 'channel',
      description: 'The channel you want set up for posts.',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
};
