const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embeds');
const logger = require('../../utils/logger');
const { getStrikes } = require('../../utils/helpers');

module.exports = {
  // Slash Command Data
  data: new SlashCommandBuilder()
    .setName('strikes')
    .setDescription("View a user's strike history")
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check strikes for')
        .setRequired(true)
    )
    .setDMPermission(false),

  // Prefix Command Data
  prefixData: {
    name: 'strikes',
    description: "View a user's strike history",
    usage: 'strikes <@user>',
    aliases: ['strikehistory', 'checkstrikes'],
  },

  // Command Execution (Works for both slash and prefix)
  async execute(interactionOrMessage, args) {
    const isSlashCommand = interactionOrMessage.isCommand?.();
    const guild = interactionOrMessage.guild;
    const requester = interactionOrMessage.member;
    
    const user = isSlashCommand
      ? interactionOrMessage.options.getUser('user')
      : interactionOrMessage.mentions.users.first();

    if (!user) {
      return this.sendResponse(
        interactionOrMessage,
        'Error',
        'You must mention a user to check strikes!',
        '#FF0000'
      );
    }

    try {
      const strikes = getStrikes(user.id);
      
      if (!strikes || strikes.length === 0) {
        return this.sendResponse(
          interactionOrMessage,
          'Strike History',
          `<@${user.id}> has no strikes.`,
          '#00FF00'
        );
      }

      // Format strike history
      const strikeList = strikes.map((strike, index) => {
        return `**#${index + 1}** - ${strike.reason}\n` +
               `• Date: <t:${Math.floor(strike.date.getTime() / 1000)}:F>\n` +
               `• Moderator: ${strike.moderator || 'Unknown'}\n`;
      }).join('\n');

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle(`⚠️ Strike History: ${user.tag}`)
        .setDescription(strikeList)
        .setColor('#FFA500')
        .setFooter({ text: `Total Strikes: ${strikes.length}` })
        .setTimestamp();

      this.sendResponse(interactionOrMessage, embed);

      // Log the action
      logger.sendLog(guild, {
        title: '📄 Strike History Viewed',
        color: '#FFA500',
        fields: [
          { name: 'Requested By', value: requester.user.tag },
          { name: 'Target User', value: user.tag },
          { name: 'Total Strikes', value: strikes.length.toString() }
        ]
      });

    } catch (error) {
      console.error('Error fetching strikes:', error);
      this.sendResponse(
        interactionOrMessage,
        'Error',
        'Failed to retrieve strike history!',
        '#FF0000'
      );
    }
  },

  // Helper method to handle responses
  sendResponse(context, titleOrEmbed, description, color) {
    const isSlash = context.isCommand?.();
    const embed = titleOrEmbed instanceof EmbedBuilder 
      ? titleOrEmbed 
      : createEmbed(titleOrEmbed, description, color);

    if (isSlash) {
      return context.replied 
        ? context.followUp({ embeds: [embed] })
        : context.reply({ embeds: [embed] });
    }
    return context.channel.send({ embeds: [embed] });
  }
};