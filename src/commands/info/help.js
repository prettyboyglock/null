const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists all available commands.'),
    async execute(interaction) {
        const commandsDir = path.join(__dirname, '..'); // Go up one level to "commands" folder
        let commandList = {};

        // Loop through subfolders and collect commands
        fs.readdirSync(commandsDir).forEach(category => {
            const categoryPath = path.join(commandsDir, category);
            if (fs.lstatSync(categoryPath).isDirectory()) {
                const commands = fs.readdirSync(categoryPath)
                    .filter(file => file.endsWith('.js'))
                    .map(file => `\`/${path.parse(file).name}\``);

                if (commands.length > 0) {
                    commandList[category] = commands;
                }
            }
        });

        // Create embed message
        const embed = new EmbedBuilder()
            .setTitle('📜 Available Commands')
            .setDescription('Here is a list of available commands:')
            .setColor(0x00A2E8) // Light blue color
            .setFooter({ text: 'Use /[command] to execute a command.' });

        // Add fields for each category
        Object.keys(commandList).forEach(category => {
            embed.addFields({ name: `📂 ${category.charAt(0).toUpperCase() + category.slice(1)}`, value: commandList[category].join(', '), inline: false });
        });

        await interaction.reply({ embeds: [embed] });
    }
};