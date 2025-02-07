const { Events } = require('discord.js');

const snipes = new Map(); // Store deleted messages

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (!message.content || message.author.bot) return;

        snipes.set(message.channel.id, {
            content: message.content,
            author: message.author,
            timestamp: new Date()
        });

        // Optional: Auto-delete after a while (e.g., 5 minutes)
        setTimeout(() => snipes.delete(message.channel.id), 300000);
    },
};

// Export snipes so the command can use it
module.exports.snipes = snipes;
