const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('define')
        .setDescription('Gets the definition of a word.')
        .addStringOption(option =>
            option.setName('word')
                .setDescription('The word to define')
                .setRequired(true)
        ),
    async execute(interaction) {
        const word = interaction.options.getString('word');

        try {
            const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const meanings = response.data[0].meanings;

            if (!meanings || meanings.length === 0) {
                return interaction.reply({ content: `❌ No definitions found for "${word}".`, ephemeral: true });
            }

            const definitions = meanings[0].definitions
                .slice(0, 3) // Limit to 3 definitions
                .map((def, index) => `**${index + 1}.** ${def.definition}`)
                .join('\n');

            const embed = new EmbedBuilder()
                .setTitle(`📖 Definition of "${word}"`)
                .setDescription(definitions)
                .setColor(0x00A2E8) // Light blue color
                .setFooter({ text: 'Powered by Free Dictionary API' });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Error fetching definition. Try another word.', ephemeral: true });
        }
    }
};