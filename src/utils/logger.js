const { EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../utils/embeds.js');
const config = require('../utils/config.js');

// Define log types and their colors
const LogType = {
  MODERATION: { color: '#FFA500', title: '⚠️ Moderation Action' },
  ERROR: { color: '#FF0000', title: '❌ Error' },
  SYSTEM: { color: '#00FF00', title: '⚙️ System Event' },
  WARNING: { color: '#FFFF00', title: '⚠️ Warning' },
  INFO: { color: '#00BFFF', title: 'ℹ️ Information' },
  RAID: { color: '#FF00FF', title: '💥 Raid Activity' }, // New raid log type
};

module.exports = {
  /**
   * Main logging function
   * @param {Guild} guild - The guild where the action occurred
   * @param {Object} options - Logging options
   */
  sendLog: async (guild, options) => {
    try {
      const logChannel = guild.channels.cache.get(config.CHANNELS.LOG);
      if (!logChannel) return;

      const embed = createEmbed(
        options.title || LogType[options.type]?.title || 'System Log',
        options.description || '',
        LogType[options.type]?.color || '#2F3136',
        {
          fields: options.fields,
          footer: { text: `Log ID: ${Date.now()}` }
        }
      );

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Failed to send log:', error);
    }
  },

  /**
   * Specialized loggers for different event types
   */
  logAction: (guild, action, user, moderator, reason, duration) => {
    const fields = [
      { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
      { name: 'Moderator', value: `${moderator.tag} (${moderator.id})`, inline: true },
      { name: 'Reason', value: reason || 'No reason provided' }
    ];

    if (duration) fields.push({ name: 'Duration', value: duration, inline: true });

    return this.sendLog(guild, {
      type: 'MODERATION',
      title: `${action} | Moderation Action`,
      fields
    });
  },

  logError: (guild, error, context) => {
    return this.sendLog(guild, {
      type: 'ERROR',
      fields: [
        { name: 'Error Message', value: error.message.substring(0, 1000) },
        { name: 'Stack Trace', value: `\`\`\`${error.stack.substring(0, 1000)}\`\`\`` },
        { name: 'Context', value: context }
      ]
    });
  },

  logSystem: (guild, event, details) => {
    return this.sendLog(guild, {
      type: 'SYSTEM',
      fields: [
        { name: 'Event', value: event },
        { name: 'Details', value: details }
      ]
    });
  },

  /**
   * Log raid activity (e.g., multiple new members joining in a short time)
   * @param {Guild} guild - The guild where the raid activity occurred
   * @param {Array} members - The list of suspected raiders
   */
  logRaid: (guild, members) => {
    const fields = [
      { name: 'Number of Members', value: `${members.length}`, inline: true },
      { name: 'Suspected Members', value: members.map(m => `${m.user.tag} (${m.id})`).join('\n'), inline: true }
    ];

    return this.sendLog(guild, {
      type: 'RAID',
      title: 'Raid Activity Detected!',
      fields
    });
  },

  /**
   * Format log messages with timestamps
   */
  formatLogMessage: (message, user) => {
    return `[${new Date().toISOString()}] ${user ? `[${user.tag}] ` : ''}${message}`;
  },

  /**
   * Quick access console logger with file line numbers
   */
  consoleLog: (message, type = 'info') => {
    const stack = new Error().stack.split('\n')[2].trim();
    const prefix = `[${new Date().toISOString()}] [${type.toUpperCase()}] ${stack}`;
    
    switch(type.toLowerCase()) {
      case 'error':
        console.error(prefix, message);
        break;
      case 'warn':
        console.warn(prefix, message);
        break;
      default:
        console.log(prefix, message);
    }
  }
};
