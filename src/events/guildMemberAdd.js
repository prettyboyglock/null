const { Events, EmbedBuilder } = require('discord.js');
const config = require('../utils/config'); // Import your config

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const guild = member.guild;
    
    // Get the welcome channel from the config
    const welcomeChannel = guild.channels.cache.get(config.welcomeChannelId); // Make sure you set this in your config.js
    
    // Create the welcome embed
    const welcomeEmbed = new EmbedBuilder()
      .setTitle(`Welcome to ${guild.name}!`)
      .setColor('#2b2d31')
      .setDescription(`Welcome to the server, ${member.user.tag}!`)
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();

    if (welcomeChannel) {
      await welcomeChannel.send({ embeds: [welcomeEmbed] });
    }

    console.log(`${member.user.tag} joined the server`);
  }
};
