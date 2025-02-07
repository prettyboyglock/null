const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embeds');
const logger = require('../../utils/logger');
const { strikes } = require('../../utils/helpers');

module.exports = {
  // Slash Command Data
  data: new SlashCommandBuilder()
    .setName('strike')
    .setDescription('Issues a strike to a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to strike')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the strike')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  // Prefix Command Data
  prefixData: {
    name: 'strike',
    description: 'Issues a strike to a user',
    usage: 'strike <@user> <reason>',
    aliases: ['warn'],
  },

  // Command Execution (Works for both slash and prefix)
  async execute(interactionOrMessage, args) {
    const isSlashCommand = interactionOrMessage.isCommand?.();
    const guild = interactionOrMessage.guild;
    const user = isSlashCommand
      ? interactionOrMessage.options.getUser('user')
      : interactionOrMessage.mentions.users.first();
    const reason = isSlashCommand
      ? interactionOrMessage.options.getString('reason')
      : args.slice(1).join(' ');
    const moderator = interactionOrMessage.member;

    if (!user) {
      return this.sendResponse(
        interactionOrMessage,
        'Error',
        'You must mention a user to strike!',
        '#FF0000'
      );
    }

    if (!reason) {
      return this.sendResponse(
        interactionOrMessage,
        'Error',
        'You must provide a reason for the strike!',
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

      // Update strikes
      const userStrikes = strikes.get(user.id) || [];
      userStrikes.push({
        reason,
        date: new Date(),
        moderator: moderator.user.tag
      });
      strikes.set(user.id, userStrikes);

      // Create response embed
      const embed = createEmbed(
        '⚠️ Strike Issued',
        `<@${user.id}> has been given a strike\n` +
        `**Reason:** ${reason}\n` +
        `**Total Strikes:** ${userStrikes.length}`,
        '#FFA500'
      );

      this.sendResponse(interactionOrMessage, embed);

      // Log the action
      logger.sendLog(guild, {
        title: '⚠️ Strike Issued',
        color: '#FFA500',
        fields: [
          { name: 'User', value: user.tag },
          { name: 'Moderator', value: moderator.user.tag },
          { name: 'Reason', value: reason },
          { name: 'Total Strikes', value: userStrikes.length.toString() }
        ]
      });

    } catch (error) {
      console.error('Error issuing strike:', error);
      this.sendResponse(
        interactionOrMessage,
        'Error',
        'Failed to issue strike!',
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