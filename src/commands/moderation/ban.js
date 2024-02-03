const { Client, Interaction, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: "ban",
    description: "Ban a member from the server.",
    options: [
        {
            name: 'target-user',
            description: 'The user to ban',
            required: true,
            type: ApplicationCommandOptionType.Mentionable,
        },
        {
            name: 'reason',
            description: 'The reason for banning.',
            type: ApplicationCommandOptionType.String,
        }
    ],
    
    permissionsRequired: [PermissionFlagsBits.BanMembers],
    botPermissions: [PermissionFlagsBits.BanMembers],

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        const targetUserId = interaction.options.get('target-user').value;
        const reason = interaction.options.get('reason')?.value || "No reason provided.";

        await interaction.deferReply();

        const targerUser = await interaction.guild.members.fetch(targetUserId);

        if(!targerUser){
            await interaction.editReply("This user doesn't exist in this server.");
            return;
        }

        if(targerUser === interaction.guild.ownerId){
            await interaction.editReply("You can't ban the server owner.");
            return;
        }

        const targerUserRolePosition = targerUser.roles.highest.position; // Highest role of the target user by position

        const requestUserRolePositon = interaction.member.roles.highest.position; //Highest role of user that role the cmd

        const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

        if(targerUserRolePosition >= requestUserRolePositon){
            await interaction.editReply("You can't ban this user becaure your role is not higher.");
            return;
        }

        if(targerUserRolePosition >= botRolePosition){
            await interaction.editReply("I can't ban this user. My role aren't higher.");
            return;
        }

        //Ban the target user
        try {
            await targerUser.ban({ reason });
            await interaction.editReply(`The user ${targerUser} has been banned.\nReason: ${reason}.`);
        } catch (error) {
            console.log(`There was an error when banning: ${error}.`);
        }
    },
}