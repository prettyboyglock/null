const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency'),
    
    async execute(interaction) {
        // Calculate latency
        const sent = await interaction.reply({ 
            content: 'Pinging...', 
            fetchReply: true, 
            ephemeral: true 
        });
        
        const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const websocketLatency = interaction.client.ws.ping;

        await interaction.editReply({
            content: `🏓 Pong!`,
            embeds: [{
                color: 0x00FF00,
                fields: [
                    { name: 'Roundtrip Latency', value: `${roundtripLatency}ms`, inline: true },
                    { name: 'Websocket Latency', value: `${websocketLatency}ms`, inline: true }
                ]
            }]
        });
    }
};