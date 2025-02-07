const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Creates a poll with up to 10 options.')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('The question for the poll')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('option1')
        .setDescription('First option')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('option2')
        .setDescription('Second option')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('option3')
        .setDescription('Third option')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('option4')
        .setDescription('Fourth option')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('option5')
        .setDescription('Fifth option')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('option6')
        .setDescription('Sixth option')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('option7')
        .setDescription('Seventh option')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('option8')
        .setDescription('Eighth option')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('option9')
        .setDescription('Ninth option')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('option10')
        .setDescription('Tenth option')
        .setRequired(false)
    ),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const options = [];

    for (let i = 1; i <= 10; i++) {
      const option = interaction.options.getString(`option${i}`);
      if (option) options.push(option);
    }

    if (options.length < 2) {
      return interaction.reply({ content: '❌ You need at least **two** options to create a poll!', ephemeral: true });
    }

    const emojiNumbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    const pollEmbed = new EmbedBuilder()
      .setColor('#3498db') // Blue color
      .setTitle('📊 Poll')
      .setDescription(`**${question}**\n\n` + options.map((opt, index) => `${emojiNumbers[index]} **${opt}**`).join('\n'))
      .setFooter({ text: `Poll created by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
      .setTimestamp();

    const pollMessage = await interaction.reply({ embeds: [pollEmbed], fetchReply: true });

    for (let i = 0; i < options.length; i++) {
      await pollMessage.react(emojiNumbers[i]);
    }
  }
};
