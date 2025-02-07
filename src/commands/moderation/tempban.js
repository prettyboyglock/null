const { SlashCommandBuilder } = require('discord.js');
const ms = require('ms'); // We'll use this to convert time strings like '1h', '2d' into milliseconds

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempban')
    .setDescription('Temporarily ban a user from the server.')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to tempban')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('duration')
        .setDescription('How long the ban lasts (e.g. 1h, 2d, 1w)')
        .setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const duration = interaction.options.getString('duration');
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: 'User not found in the server.', ephemeral: true });
    }

    // Check if the duration is valid
    const milliseconds = ms(duration);
    if (!milliseconds) {
      return interaction.reply({ content: 'Invalid duration. Please use a valid time format (e.g., 1h, 2d, 1w).', ephemeral: true });
    }

    try {
      // Ban the user
      await member.ban({ reason: `Tempban for ${duration}` });

      // Send confirmation
      await interaction.reply({ content: `${user.tag} has been temporarily banned for ${duration}.`, ephemeral: true });

      // Unban the user after the specified duration
      setTimeout(async () => {
        await interaction.guild.members.unban(user.id);
        console.log(`${user.tag} has been unbanned after tempban duration.`);
      }, milliseconds);

    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'An error occurred while trying to tempban the user.', ephemeral: true });
    }
  },
};