const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Displays information about a user.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user you want to get information about.')
        .setRequired(false)
    ),

  async execute(interaction) {
    // Get the user specified in the command (defaults to the user who invoked the command)
    const user = interaction.options.getUser('user') || interaction.user;

    // Get the guild member for more detailed info (like join date)
    const member = await interaction.guild.members.fetch(user.id);

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`${user.tag}'s Information`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Username', value: user.username, inline: true },
        { name: 'Tag', value: user.discriminator, inline: true },
        { name: 'User ID', value: user.id, inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: 'Status', value: member.presence ? member.presence.status : 'Offline', inline: true },
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};