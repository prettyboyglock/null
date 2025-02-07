const { Events, EmbedBuilder } = require('discord.js');
const config = require('../utils/config'); // Import your config

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    const guild = member.guild;
    
    // Get the goodbye channel from the config
    const goodbyeChannel = guild.channels.cache.get(config.goodbyeChannelId); // Make sure you set this in your config.js

    // Create the goodbye embed
    const goodbyeEmbed = new EmbedBuilder()
      .setTitle(`Goodbye from ${guild.name}`)
      .setColor('#2b2d31')
      .setDescription(`We're sad to see you go, ${member.user.tag}.`)
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();

    if (goodbyeChannel) {
      await goodbyeChannel.send({ embeds: [goodbyeEmbed] });
    }

    console.log(`                                                ${member.user.tag} left ${guild.name}`);
  }
};
