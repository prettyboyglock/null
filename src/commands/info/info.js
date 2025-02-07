const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');


module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Shows information about the bot.'),

    async execute(interaction) {
        try {
          const bot = interaction.client;
          const server = interaction.guild;
    
          const uptime = bot.uptime;
          const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
          const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
    
          const infoEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Bot Information')
            .setThumbnail(bot.user.displayAvatarURL())
            .addFields(
              { name: 'Bot Name', value: bot.user.username, inline: true },
              { name: 'Bot ID', value: bot.user.id, inline: true },
              { name: 'Server Name', value: server.name, inline: true },
              { name: 'Server ID', value: server.id, inline: true },
              { name: 'Total Members', value: `${server.memberCount}`, inline: true },
              { name: 'Bot Uptime', value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
              { name: 'Bot Creator', value: '{SpinettaPrive} (ID:911089298806292510)', inline: true }
            )
            .setFooter({ text: 'Bot Info' })
            .setTimestamp();
    
          await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
        } catch (error) {
          console.error('Error executing /info command:', error);
          await interaction.reply({ content: '❌ An error occurred while executing this command!', ephemeral: true });
        }
      },
    
};
