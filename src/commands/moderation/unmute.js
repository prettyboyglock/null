const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { sendLog } = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to unmute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for unmuting')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const user = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'No reason provided';
            const member = await interaction.guild.members.fetch(user.id);

            if (!member.moderatable) {
                return interaction.editReply('I cannot unmute this user!');
            }

            if (!member.communicationDisabledUntil) {
                return interaction.editReply('This user is not muted!');
            }

            await member.timeout(null, reason);
            
            await interaction.editReply({
                content: `✅ Successfully unmuted ${user.tag}`,
                ephemeral: true
            });

            // Log the action
            sendLog(interaction.guild, {
                title: '⏲️ Mute Removed',
                color: '#00FF00',
                fields: [
                    { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason }
                ]
            });

        } catch (error) {
            console.error('Unmute Error:', error);
            await interaction.editReply({
                content: '❌ Failed to unmute!',
                ephemeral: true
            });
        }
    }
};