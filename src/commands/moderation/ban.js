const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  // Slash Command Data
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for the ban')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  // Prefix Command Data
  prefixData: {
    name: 'ban',
    description: 'Bans a user from the server',
    usage: 'ban <@user> [reason]',
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
        ? interactionOrMessage.reply({ content: 'You must mention a user to ban.', ephemeral: true })
        : interactionOrMessage.channel.send({ embeds: [createEmbed('Error', 'You must mention a user to ban.', '#FF0000')] });
    }

    if (!interactionOrMessage.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return isSlashCommand
        ? interactionOrMessage.reply({ content: 'You do not have permission to ban members.', ephemeral: true })
        : interactionOrMessage.channel.send({ embeds: [createEmbed('Permission Denied', 'You do not have permission to ban members.', '#FF0000')] });
    }

    try {
      await interactionOrMessage.guild.members.ban(user, { reason });
      const embed = createEmbed('User Banned', `<@${user.id}> has been banned. Reason: ${reason}`, '#FF0000');

      if (isSlashCommand) {
        await interactionOrMessage.reply({ embeds: [embed] });
      } else {
        await interactionOrMessage.channel.send({ embeds: [embed] });
      }

      logger.sendLog(interactionOrMessage.guild, {
        title: '⚠️ User Banned',
        color: '#FF0000',
        fields: [
          { name: 'User', value: user.tag },
          { name: 'Moderator', value: interactionOrMessage.author.tag },
          { name: 'Reason', value: reason },
        ],
      });
    } catch (error) {
      console.error(error);
      const errorEmbed = createEmbed('Error', 'Failed to ban the user.', '#FF0000');

      if (isSlashCommand) {
        await interactionOrMessage.reply({ embeds: [errorEmbed], ephemeral: true });
      } else {
        await interactionOrMessage.channel.send({ embeds: [errorEmbed] });
      }
    }
  },
};