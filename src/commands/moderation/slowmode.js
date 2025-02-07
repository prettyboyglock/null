const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Sets the slowmode for the current channel.')
    .addIntegerOption(option =>
      option.setName('seconds')
        .setDescription('Slowmode duration in seconds (0 to disable).')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');
    const channel = interaction.channel;

    if (seconds < 0 || seconds > 21600) {
      return interaction.reply({ content: '❌ Slowmode duration must be between 0 and 21600 seconds (6 hours).', ephemeral: true });
    }

    try {
      await channel.setRateLimitPerUser(seconds);

      const embed = new EmbedBuilder()
        .setColor(seconds === 0 ? '#00ff00' : '#ffcc00') // Green if disabled, yellow if enabled
        .setTitle(seconds === 0 ? '🚀 Slowmode Disabled' : '⏳ Slowmode Enabled')
        .setDescription(`The slowmode for this channel has been set to **${seconds} seconds** by **${interaction.user.tag}**.`)
        .setFooter({ text: seconds === 0 ? 'Users can now send messages freely.' : 'Users must wait before sending another message.' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error setting slowmode:', error);
      await interaction.reply({ content: '❌ An error occurred while setting slowmode!', ephemeral: true });
    }
  }
};