const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  AttachmentBuilder,
} = require('discord.js');
const { Font, RankCardBuilder } = require('canvacord');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const Level = require('../../models/Level');
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

    await interaction.deferReply();

    const commandName = 'level';
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    let cooldown = await Cooldowns.findOne({ commandName, userId, guildId });

    if(cooldown && Date.now() < cooldown.endsAt){
      const { default: prettyMs } = await import('pretty-ms');

      await interaction.editReply(`I'm sorry. You can't use this command. It's now on cooldown, time left: ${prettyMs(cooldown.endsAt - Date.now())}`);
      return;
    }

    if(!cooldown){
      cooldown = new Cooldowns({ commandName, userId, guildId });
    }

    const mentionedUserId = interaction.options.get('target-user')?.value;
    const targetUserId = mentionedUserId || interaction.member.id;
    const targetUserObj = await interaction.guild.members.fetch(targetUserId);

    const fetchedLevel = await Level.findOne({
      userId: targetUserId,
      guildId: interaction.guild.id,
    });

    if (!fetchedLevel) {
      interaction.editReply(
        mentionedUserId
          ? `${targetUserObj.user.tag} doesn't have any levels yet. Try again when they chat a little more.`
          : "You don't have any levels yet. Chat a little more and try again."
      );
      return;
    }

    let allLevels = await Level.find({ guildId: interaction.guild.id }).select(
      '-_id userId level xp'
    );

    allLevels.sort((a, b) => {
      if (a.level === b.level) {
        return b.xp - a.xp;
      } else {
        return b.level - a.level;
      }
    });

    let currentRank = allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

    Font.loadDefault();

      const rank = new RankCardBuilder();
        rank.setUsername(targetUserObj.user.username+' 😍');
        rank.setAvatar(targetUserObj.user.displayAvatarURL({ size: 256 }));
        rank.setCurrentXP(fetchedLevel.xp);
        rank.setRequiredXP(calculateLevelXp(fetchedLevel.level));
        rank.setLevel(fetchedLevel.level);
        rank.setRank(currentRank);
        rank.setStatus(targetUserObj.presence.status);
      const data = await rank.build({

        format: 'png'
      
      });
    const attachment = new AttachmentBuilder(data);
    interaction.editReply({ files: [attachment] });
    
    cooldown.endsAt = Date.now() + 300_000; // 3600_000 = 1h
    await cooldown.save();
  },

  name: 'level',
  description: "Shows your/someone's level.",
  options: [
    {
      name: 'target-user',
      description: 'The user whose level you want to see.',
      type: ApplicationCommandOptionType.Mentionable,
    },
  ],
};
