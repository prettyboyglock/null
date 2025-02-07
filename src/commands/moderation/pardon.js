const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embeds');
const logger = require('../../utils/logger');
const { strikes } = require('../../utils/helpers'); // Assume strikes are stored here

module.exports = {
  // Slash Command Data
  data: new SlashCommandBuilder()
    .setName('pardon')
    .setDescription('Removes the most recent strike from a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to pardon')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  // Prefix Command Data
  prefixData: {
    name: 'pardon',
    description: 'Removes the most recent strike from a user',
    usage: 'pardon <@user>',
    aliases: ['forgive'],
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
        'You must mention a user to pardon!',
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
      const userStrikes = strikes.get(user.id) || [];
      
      if (userStrikes.length === 0) {
        return this.sendResponse(
          interactionOrMessage,
          'No Strikes',
          `<@${user.id}> has no strikes to pardon!`,
          '#FFFF00'
        );
      }

      // Remove the last strike
      const pardonedStrike = userStrikes.pop();
      
      // Update the strikes map
      if (userStrikes.length === 0) {
        strikes.delete(user.id);
      } else {
        strikes.set(user.id, userStrikes);
      }

      // Create response embed
      const embed = createEmbed(
        'Strike Pardoned',
        `Removed strike from <@${user.id}>\n` +
        `**Remaining Strikes:** ${userStrikes.length}\n` +
        `**Pardoned Strike:** ${pardonedStrike.reason}`,
        '#00FF00'
      );

      this.sendResponse(interactionOrMessage, embed);

      // Log the action
      logger.sendLog(guild, {
        title: '🔄 Strike Pardoned',
        color: '#00FF00',
        fields: [
          { name: 'User', value: user.tag },
          { name: 'Moderator', value: moderator.user.tag },
          { name: 'Remaining Strikes', value: userStrikes.length.toString() },
          { name: 'Pardoned Reason', value: pardonedStrike.reason }
        ]
      });

    } catch (error) {
      console.error('Error pardoning strike:', error);
      this.sendResponse(
        interactionOrMessage,
        'Error',
        'Failed to pardon strike!',
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