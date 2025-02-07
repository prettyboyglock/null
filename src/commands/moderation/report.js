const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const { sendLog } = require('../../utils/logger');
const config = require('../../utils/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Report a user to moderators')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to report')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the report')
                .setRequired(true)),
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const reporter = interaction.user;
            const target = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason');
            const reportId = uuidv4().split('-')[0];

            // Create report embed
            const reportEmbed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('🚨 New Report')
                .addFields(
                    { name: 'Report ID', value: `\`${reportId}\``, inline: true },
                    { name: 'Reported User', value: `${target.tag} (${target.id})`, inline: true },
                    { name: 'Reason', value: reason },
                    { name: 'Reporter', value: `${reporter.tag} (${reporter.id})`, inline: true }
                )
                .setTimestamp();

            // Create action buttons
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`resolve_${reportId}`)
                    .setLabel('Resolve')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`delete_${reportId}`)
                    .setLabel('Delete')
                    .setStyle(ButtonStyle.Danger)
            );

            // Send to reports channel
            const reportChannel = interaction.guild.channels.cache.get(config.REPORT_CHANNEL_ID);
            if (!reportChannel) throw new Error('Report channel not found');

            await reportChannel.send({
                content: `<@&${config.MOD_ROLE_ID}> New report!`,
                embeds: [reportEmbed],
                components: [buttons]
            });

            await interaction.editReply({
                content: '✅ Your report has been submitted!',
                ephemeral: true
            });

        } catch (error) {
            console.error('Report Error:', error);
            await interaction.editReply({
                content: '❌ Failed to submit report!',
                ephemeral: true
            });
        }
    }
};