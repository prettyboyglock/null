require('dotenv').config();
const { REST, Routes } = require('discord.js');
const path = require('path');
const fs = require('fs');

// Load environment variables
const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

// Configure REST client
const rest = new REST({ version: '10' }).setToken(TOKEN);

// Load commands dynamically
const loadCommands = () => {
  const commands = [];
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFolders = fs.readdirSync(commandsPath);

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(path.join(folderPath, file));
      if (command.data) {
        commands.push(command.data.toJSON());
      }
    }
  }
  return commands;
};

(async () => {
  try {
    const commands = loadCommands();
    console.log(`📦 Found ${commands.length} slash commands to deploy`);

    // Deployment mode (Global by default)
    const deploymentType = process.argv.includes('--guild') ? 'guild' : 'global';
    const route = deploymentType === 'guild'
      ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID) // Guild-specific (faster updates)
      : Routes.applicationCommands(CLIENT_ID); // Global (takes up to 1 hour)

    console.log(`🚀 Deploying ${commands.length} commands to ${deploymentType.toUpperCase()}`);

    // Execute deployment
    const data = await rest.put(route, { body: commands });

    console.log(`✅ Successfully deployed ${data.length} slash commands!`);
    console.log('🔗 Available commands:');
    data.forEach((cmd, index) => {
      console.log(`${index + 1}. /${cmd.name} - ${cmd.description}`);
    });

    if (deploymentType === 'global') {
      console.log('⏳ Global commands may take up to 1 hour to update.');
    }

  } catch (error) {
    console.error('❌ Deployment failed:');

    // Enhanced error handling
    if (error.code === 50001) {
      console.log('Missing Access: Verify the bot has the "applications.commands" scope.');
    } else if (error.code === 40041) {
      console.log('Invalid Token: Check your .env file configuration.');
    } else {
      console.error(error.stack);
    }

    process.exit(1);
  }
})();
