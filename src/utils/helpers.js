const { PermissionsBitField } = require('discord.js');

// Strike storage - replace with database in production
const strikes = new Map();

module.exports = {
  // Strike management
  strikes,
  getStrikes: (userId) => strikes.get(userId) || [],
  addStrike: (userId, data) => {
    const userStrikes = strikes.get(userId) || [];
    userStrikes.push({ ...data, timestamp: Date.now() });
    strikes.set(userId, userStrikes);
  },
  removeStrike: (userId) => {
    const userStrikes = strikes.get(userId) || [];
    if (userStrikes.length === 0) return null;
    const removed = userStrikes.pop();
    strikes.set(userId, userStrikes);
    return removed;
  },
  resetStrikes: (userId) => strikes.delete(userId),

  // User input handling
  getResponse: async (context, prompt, options = {}) => {
    try {
      const { time = 60000, max = 1 } = options;
      const isMessage = context instanceof Message;
      
      if (isMessage) {
        await context.channel.send(prompt);
      } else {
        await context.reply({ content: prompt, ephemeral: options.ephemeral });
      }

      const filter = m => m.author.id === context.author.id;
      const collector = context.channel.createMessageCollector({ filter, time, max });

      return new Promise((resolve) => {
        collector.on('collect', m => resolve(m.content));
        collector.on('end', collected => resolve(collected.first()?.content));
      });
    } catch (error) {
      console.error('Error getting response:', error);
      return null;
    }
  },

  // Time formatting
  formatDuration: (ms) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}d ${hours}h ${minutes}m`.replace(/\b0[^\s]*/g, '');
  },

  // Pagination helper
  paginate: (array, itemsPerPage = 10) => {
    const pages = [];
    for (let i = 0; i < array.length; i += itemsPerPage) {
      pages.push(array.slice(i, i + itemsPerPage));
    }
    return pages;
  },

  // Validation helpers
  isValidUser: async (guild, userId) => {
    try {
      return await guild.members.fetch(userId);
    } catch {
      return null;
    }
  },

  isValidDuration: (duration) => {
    const min = 60_000; // 1 minute
    const max = 2_419_200_000; // 28 days
    return duration >= min && duration <= max;
  },

  // Permission checker
  checkPermissions: (member, permissions) => {
    const missing = member.permissions.missing(permissions);
    return {
      hasPermissions: missing.length === 0,
      missing
    };
  }
};