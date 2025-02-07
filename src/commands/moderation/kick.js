const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embeds');
const logger = require('../../utils/config');

module.exports = {
  // Slash Command Data
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to kick')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for the kick')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),

  // Prefix Command Data
  prefixData: {
    name: 'kick',
    description: 'Kicks a user from the server',
    usage: 'kick <@user> [reason]',
    aliases: [],
  },

  // Command Execution (Works for both slash and prefix)
  async execute(interactionOrMessage, args) {
    const isSlashCommand = interactionOrMessage.isCommand?.();
    const user = isSlashCommand
      ? interactionOrMessage.options.getUser('user')
      : interactionOrMessage.mentions.users.first();
    const reason = isSlashCommand
      ? interactionOrMessage.options.getString('reason') || 'No reason provided'
      : args.slice(1).join(' ') || 'No reason provided';

    if (!user) {
      return isSlashCommand
        ? interactionOrMessage.reply({ content: '❌ You must mention a user to kick.', ephemeral: true })
        : interactionOrMessage.channel.send({ embeds: [createEmbed('Error', 'You must mention a user to kick.', '#FF0000')] });
    }

    if (!interactionOrMessage.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return isSlashCommand
        ? interactionOrMessage.reply({ content: '❌ You do not have permission to kick members.', ephemeral: true })
        : interactionOrMessage.channel.send({ embeds: [createEmbed('Permission Denied', 'You do not have permission to kick members.', '#FF0000')] });
    }

    const member = interactionOrMessage.guild.members.cache.get(user.id);
    if (!member) {
      return isSlashCommand
        ? interactionOrMessage.reply({ content: '❌ User not found in this server.', ephemeral: true })
        : interactionOrMessage.channel.send({ embeds: [createEmbed('Error', 'User not found in this server.', '#FF0000')] });
    }

    if (!member.kickable) {
      return isSlashCommand
        ? interactionOrMessage.reply({ content: '❌ I cannot kick this user.', ephemeral: true })
        : interactionOrMessage.channel.send({ embeds: [createEmbed('Error', 'I cannot kick this user.', '#FF0000')] });
    }

    try {
      await member.kick(reason);
      const embed = createEmbed(
        'User Kicked',
        `<@${user.id}> has been kicked.\n**Reason:** ${reason}`,
        '#FFA500'
      );

      if (isSlashCommand) {
        await interactionOrMessage.reply({ embeds: [embed] });
      } else {
        await interactionOrMessage.channel.send({ embeds: [embed] });
      }

      // Log the action
      logger.sendLog(interactionOrMessage.guild, {
        title: '⚠️ User Kicked',
        color: '#FFA500',
        fields: [
          { name: 'User', value: user.tag },
          { name: 'Moderator', value: interactionOrMessage.author.tag },
          { name: 'Reason', value: reason }
        ]
      });

    } catch (error) {
      console.error('Error kicking user:', error);
      const errorEmbed = createEmbed('Error', 'Failed to kick the user.', '#FF0000');

      if (isSlashCommand) {
        await interactionOrMessage.reply({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await interactionOrMessage.channel.send({ embeds: [errorEmbed] });
      }
    }
  },
};