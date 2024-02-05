const { Client, Interaction, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const Posts = require('../../models/Posts');

function isValidHttpUrl(string) {
    let url;
    
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
  
    return url.protocol === "http:" || url.protocol === "https:";
  }

module.exports = {

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        const modal = new ModalBuilder({
            customId: `postModal-${interaction.user.id}`,
            title: 'POST',

        });

        const postTitle = new TextInputBuilder({
            customId: 'postTitle',
            label: `Enter the post title`,
            style: TextInputStyle.Short
        });

        const postContent = new TextInputBuilder({
            customId: 'postContent',
            label: `The post content`,
            style: TextInputStyle.Paragraph
        });

        const postImages = new TextInputBuilder({
            customId: 'postImages',
            label: `The post image`,
            style: TextInputStyle.Paragraph,
            required: false
        });

        const firstActionRow = new ActionRowBuilder().addComponents(postTitle);
        const secondActionRow = new ActionRowBuilder().addComponents(postContent);
        const thirdActionRow = new ActionRowBuilder().addComponents(postImages);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        for(let i = 0; i < 2; i++){
            const postRow = new TextInputBuilder({
                customId: `postRow-${i}`,
                label: `New row`,
                style: TextInputStyle.Paragraph,
                required: false
            });

            const newRow = new ActionRowBuilder().addComponents(postRow);

            modal.addComponents(newRow);
        }

        await interaction.showModal(modal);

        //wait for modal to be submited
        const filter = (interaction) => interaction.customId ===  `postModal-${interaction.user.id}`;

        const postChannelId = await Posts.findOne({ guildId: interaction.guildId });

        interaction.awaitModalSubmit({ filter, time: 120_000 })
        .then((modalInteraction) => {
            const postTitleValue = modalInteraction.fields.getTextInputValue('postTitle');
            const postContentValue = modalInteraction.fields.getTextInputValue('postContent');
            const postImageValue = modalInteraction.fields.getTextInputValue('postImages');

            if(!postChannelId || !postChannelId.channelId){
                interaction.editReply("Can't send post. No post channel configure for this server. Set it up by `/post-configure`");
                return;
            }

            modalInteraction.reply({content: `Message sent successfully.`, ephemeral: true});

            const postEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(postTitleValue)
            .setDescription(postContentValue)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 128 }));

            
            if(postImageValue && isValidHttpUrl(postImageValue)){
                postEmbed.setImage(postImageValue);
            }
                
            for(let i = 0; i < 2; i++){
                const postRow = modalInteraction.fields.getTextInputValue(`postRow-${i}`);

                let postValue = `**${i+1}. **` + postRow;
                if(postRow){
                    postEmbed.addFields(
                        { name: '☟' ,value: postValue }
                    );
                }
            }

            client.channels.cache.get(postChannelId.channelId).send({ embeds: [postEmbed] });
        })
        .catch((e) => {
            console.log(`Failed to submit modal: ${e}`);
        });
    },

    name: 'post',
    description: 'Create a post in specific channel',
}