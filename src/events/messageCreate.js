const config = require('../utils/config');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Find the command
    const command = Object.values(commands)
      .flatMap(category => Object.values(category))
      .find(cmd => cmd.prefixData?.name === commandName || cmd.prefixData?.aliases?.includes(commandName));

    if (!command) return;

    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.channel.send({ embeds: [createEmbed('Error', 'An error occurred while executing the command.', '#FF0000')] });
    }
  },
};
