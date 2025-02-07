const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embeds');
const logger = require('../../utils/logger');
const { strikes } = require('../../utils/helpers'); // Assume strikes are stored here

module.exports = {
  // Slash Command Data
  data: new SlashCommandBuilder()
    .setName('resetstrikes')
    .setDescription('Resets all strikes for a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to reset strikes for')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  // Prefix Command Data
  prefixData: {
    name: 'resetstrikes',
    description: 'Resets all strikes for a user',
    usage: 'resetstrikes <@user>',
    aliases: ['clearstrikes'],
  },

  // Command Execution (Works for both slash and prefix)
  async execute(interactionOrMessage, args) {
    const isSlashCommand = interactionOrMessage.isCommand?.();
    const guild = interactionOrMessage.guild;
    const user = isSlashCommand
      ? interactionOrMessage.options.getUser('user')
      : interactionOrMessage.mentions.users.first();
    const moderator = interactionOrMessage.member;

    if (!user) {
      return this.sendResponse(
        interactionOrMessage,
        'Error',
        'You must mention a user to reset strikes!',
        '#FF0000'
      );
    }

    if (!moderator.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return this.sendResponse(
        interactionOrMessage,
        'Permission Denied',
        'You need **Moderate Members** permission!',
        '#FF0000'
      );
    }

    try {
      const hadStrikes = strikes.has(user.id);
      
      if (!hadStrikes) {
        return this.sendResponse(
          interactionOrMessage,
          'No Strikes',
          `<@${user.id}> has no strikes to reset!`,
          '#FFFF00'
        );
      }

      // Delete all strikes
      strikes.delete(user.id);

      // Create response embed
      const embed = createEmbed(
        'Strikes Reset',
        `All strikes for <@${user.id}> have been cleared!`,
        '#00FF00'
      );

      this.sendResponse(interactionOrMessage, embed);

      // Log the action
      logger.sendLog(guild, {
        title: '🔄 Strikes Reset',
        color: '#00FF00',
        fields: [
          { name: 'User', value: user.tag },
          { name: 'Moderator', value: moderator.user.tag },
          { name: 'Previous Strike Count', value: hadStrikes ? '1+' : '0' }
        ]
      });

    } catch (error) {
      console.error('Error resetting strikes:', error);
      this.sendResponse(
        interactionOrMessage,
        'Error',
        'Failed to reset strikes!',
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