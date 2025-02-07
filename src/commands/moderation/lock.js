const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Locks the current channel, preventing members from sending messages.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const channel = interaction.channel;

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false
      });

      const lockEmbed = new EmbedBuilder()
        .setColor('#ff0000') // Red color
        .setTitle('🔒 Channel Locked')
        .setDescription(`This channel has been locked by **${interaction.user.tag}**.`)
        .setFooter({ text: 'Use /unlock to reopen the channel.' })
        .setTimestamp();

      await interaction.reply({ embeds: [lockEmbed] });
    } catch (error) {
      console.error('Error locking the channel:', error);
      await interaction.reply({
        content: '❌ An error occurred while locking this channel!',
        ephemeral: true
      });
    }
  }
};