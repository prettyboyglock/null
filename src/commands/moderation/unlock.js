const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlocks the current channel, allowing members to send messages again.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const channel = interaction.channel;

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: true
      });

      const unlockEmbed = new EmbedBuilder()
        .setColor('#00ff00') // Green color
        .setTitle('🔓 Channel Unlocked')
        .setDescription(`This channel has been unlocked by **${interaction.user.tag}**.`)
        .setFooter({ text: 'Users can now send messages again.' })
        .setTimestamp();

      await interaction.reply({ embeds: [unlockEmbed] });
    } catch (error) {
      console.error('Error unlocking the channel:', error);
      await interaction.reply({
        content: '❌ An error occurred while unlocking this channel!',
        ephemeral: true
      });
    }
  }
};