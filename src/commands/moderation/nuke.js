const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
  // Slash Command Data
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('Nukes the current channel (clone & delete)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  // Prefix Command Data
  prefixData: {
    name: 'nuke',
    description: 'Nukes the current channel (clone & delete)',
    usage: 'nuke',
    aliases: ['resetchannel'],
  },

  // Command Execution (Works for both slash and prefix)
  async execute(interactionOrMessage) {
    const isSlashCommand = interactionOrMessage.isCommand?.();
    const channel = isSlashCommand ? interactionOrMessage.channel : interactionOrMessage.channel;
    const user = isSlashCommand ? interactionOrMessage.user : interactionOrMessage.author;

    if (!interactionOrMessage.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return isSlashCommand
        ? interactionOrMessage.reply({ content: '❌ You need **Manage Channels** permission!', ephemeral: true })
        : interactionOrMessage.channel.send({ embeds: [createEmbed('Permission Denied', 'You need **Manage Channels** permission!', '#FF0000')] });
    }

    try {
      // Create confirmation embed
      const confirmEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('💣 Nuke Confirmation')
        .setDescription('Are you sure you want to nuke this channel?')
        .addFields(
          { name: 'Channel', value: channel.name },
          { name: 'Warning', value: 'This action cannot be undone!' }
        );

      // Create buttons
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_nuke')
          .setLabel('NUKE IT!')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('cancel_nuke')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary)
      );

      // Send confirmation message
      const response = isSlashCommand 
        ? await interactionOrMessage.reply({ 
            embeds: [confirmEmbed], 
            components: [buttons],
            fetchReply: true 
          })
        : await channel.send({ 
            embeds: [confirmEmbed], 
            components: [buttons] 
          });

      // Create button collector
      const filter = i => i.user.id === user.id;
      const collector = response.createMessageComponentCollector({ 
        filter, 
        time: 15000 
      });

      collector.on('collect', async i => {
        if (i.customId === 'confirm_nuke') {
          collector.stop();
          
          // Clone channel
          const newChannel = await channel.clone();
          await channel.delete();

          // Send confirmation message
          const nukeEmbed = createEmbed(
            '💣 Channel Nuked',
            `Nuked by ${user.tag}`,
            '#FF0000'
          );
          
          const nukeMessage = await newChannel.send({ embeds: [nukeEmbed] });
          setTimeout(() => nukeMessage.delete(), 5000);

          // Log the action
          logger.sendLog(newChannel.guild, {
            title: '💣 Channel Nuked',
            color: '#FF0000',
            fields: [
              { name: 'Channel', value: channel.name },
              { name: 'Action By', value: user.tag },
              { name: 'New Channel', value: newChannel.toString() }
            ]
          });

          await i.update({ 
            content: '✅ Channel nuked successfully!', 
            embeds: [],
            components: [] 
          });

        } else if (i.customId === 'cancel_nuke') {
          collector.stop();
          await i.update({
            content: '❌ Nuke cancelled!',
            embeds: [],
            components: []
          });
        }
      });

      collector.on('end', async (collected) => {
        if (collected.size === 0) {
          await response.edit({
            content: '⏰ Nuke command timed out!',
            embeds: [],
            components: []
          });
        }
      });

    } catch (error) {
      console.error('Error nuking channel:', error);
      const errorEmbed = createEmbed('Error', 'Failed to nuke channel!', '#FF0000');
      
      if (isSlashCommand) {
        await interactionOrMessage.followUp({ 
          embeds: [errorEmbed], 
          ephemeral: true 
        });
      } else {
        await channel.send({ embeds: [errorEmbed] });
      }
    }
  },
};