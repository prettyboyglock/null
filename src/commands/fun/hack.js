const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hack')
        .setDescription('Fake hacks a user.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to hack')
                .setRequired(true)
        ),
    async execute(interaction) {
        const target = interaction.options.getUser('target');

        // Send initial message
        let message = await interaction.reply({ content: `🔍 Initiating hack on ${target}...`, fetchReply: true });

        const steps = [
            '🟢 Bypassing firewall...',
            '📡 Extracting IP address...',
            '🔓 Cracking passwords...',
            '💾 Downloading private data...',
            '📤 Uploading to dark web...',
            `✅ Hack complete! ${target} is now under our control. 😈`
        ];

        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 2 seconds
            await message.edit(steps[i]);
        }
    }
};

