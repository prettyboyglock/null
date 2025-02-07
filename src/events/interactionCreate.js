module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Handle slash commands
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);
        await interaction.reply({ 
          content: '❌ An error occurred while executing this command!',
          ephemeral: true 
        });
      }
    }
    
    // Handle button interactions
    else if (interaction.isButton()) {
      try {
        const [actionType, ...args] = interaction.customId.split('_');
        
        switch(actionType) {
          case 'confirm':
          case 'cancel':
            // Nuke confirmation buttons
            if (args.includes('nuke')) {
              const nukeCommand = require('../commands/moderation/nuke');
              await nukeCommand.handleButton(interaction);
            }
            break;

          case 'resolve':
          case 'delete':
            // Report system buttons
            await handleReportAction(interaction, actionType);
            break;

          default:
            console.warn('Unhandled button interaction:', interaction.customId);
        }
      } catch (error) {
        console.error('Error handling button interaction:', error);
        await interaction.reply({
          content: '❌ Failed to process button interaction!',
          ephemeral: true
        });
      }
    }
  }
};

async function handleReportAction(interaction, actionType) {
  await interaction.deferUpdate();
  const reportId = interaction.customId.split('_')[1];
  
  try {
    // Update embed with resolution status
    const originalEmbed = interaction.message.embeds[0];
    const statusColor = actionType === 'resolve' ? '#00FF00' : '#FF0000';
    const statusText = `${actionType}d by ${interaction.user.tag}`;

    const updatedEmbed = new EmbedBuilder(originalEmbed.data)
      .setColor(statusColor)
      .addFields({ name: 'Status', value: statusText });

    // Edit the original report message
    await interaction.message.edit({
      embeds: [updatedEmbed],
      components: []
    });

    // Send confirmation to moderator
    await interaction.followUp({
      content: `Report ${reportId} has been ${actionType}d!`,
      ephemeral: true
    });

    // Log the action
    const logger = require('../utils/logger');
    logger.sendLog(interaction.guild, {
      title: `📝 Report ${actionType}d`,
      color: statusColor,
      fields: [
        { name: 'Report ID', value: reportId },
        { name: 'Moderator', value: interaction.user.tag }
      ]
    });

  } catch (error) {
    console.error('Report Handling Error:', error);
    await interaction.followUp({
      content: '❌ Failed to process report action!',
      ephemeral: true
    });
  }
}