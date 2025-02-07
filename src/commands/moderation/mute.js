const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  // Slash Command Data
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a user for a specific duration')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to Mute')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Mute duration in minutes')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320) // 28 days max (Discord limit)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the mute')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  // Prefix Command Data
  prefixData: {
    name: 'mute',
    description: 'Mute a user for a specific duration',
    usage: 'Mute <@user> <minutes> [reason]',
    aliases: ['mute', 'tempmute'],
  },

  // Command Execution (Works for both slash and prefix)
  async execute(interactionOrMessage, args) {
    const isSlashCommand = interactionOrMessage.isCommand?.();
    const guild = interactionOrMessage.guild;
    const moderator = interactionOrMessage.member;

    // Get command parameters
    const user = isSlashCommand
      ? interactionOrMessage.options.getUser('user')
      : interactionOrMessage.mentions.users.first();
    const duration = isSlashCommand
      ? interactionOrMessage.options.getInteger('duration')
      : parseInt(args[1]);
    const reason = isSlashCommand
      ? interactionOrMessage.options.getString('reason') || 'No reason provided'
      : args.slice(2).join(' ') || 'No reason provided';

    // Validate input
    if (!user) {
      return this.sendResponse(
        interactionOrMessage,
        'Error',
        'You must mention a user to mute!',
        '#FF0000'
      );
    }

    if (!duration || isNaN(duration)) {
      return this.sendResponse(
        interactionOrMessage,
        'Error',
        'Please provide a valid duration in minutes!',
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
      const member = await guild.members.fetch(user.id);
      if (!member) {
        return this.sendResponse(
          interactionOrMessage,
          'Error',
          'User not found in this server!',
          '#FF0000'
        );
      }

      if (!member.moderatable) {
        return this.sendResponse(
          interactionOrMessage,
          'Error',
          'I cannot mute this user!',
          '#FF0000'
        );
      }

      // Convert minutes to milliseconds
      const durationMs = duration * 60 * 1000;

      // Apply timeout
      await member.timeout(durationMs, reason);

      // Create response embed
      const embed = createEmbed(
        '⏳ User muted Out',
        `<@${user.id}> has been muted for **${duration} minutes**\n` +
        `**Reason:** ${reason}`,
        '#FFA500'
      );

      this.sendResponse(interactionOrMessage, embed);

      // Log the action
      logger.sendLog(guild, {
        title: '⏳ User muted',
        color: '#FFA500',
        fields: [
          { name: 'User', value: user.tag },
          { name: 'Moderator', value: moderator.user.tag },
          { name: 'Duration', value: `${duration} minutes` },
          { name: 'Reason', value: reason }
        ]
      });

    } catch (error) {
      console.error('Error muting out user:', error);
      this.sendResponse(
        interactionOrMessage,
        'Error',
        'Failed to mute user!',
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