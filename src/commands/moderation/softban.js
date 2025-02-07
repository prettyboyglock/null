const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Ban a user and delete their messages in the server.')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to softban')
        .setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({ content: 'User not found in the server.', ephemeral: true });
    }

    try {
      // Softban the user (ban and then unban immediately)
      await member.ban({ reason: 'Softban (messages deleted)' });
      await interaction.guild.members.unban(user.id);

      // Send confirmation
      await interaction.reply({ content: `${user.tag} has been softbanned and their messages have been deleted.`, ephemeral: true });

    } catch (error) {
      console.error(error);
      return interaction.reply({ content: 'An error occurred while trying to softban the user.', ephemeral: true });
    }
  },
};
