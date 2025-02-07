require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { readdirSync } = require('fs');
const path = require('path');
const config = require('C:/Users/shuki/Documents/nullsrc/src/utils/config.js');


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration
  ]
});

// Initialize collections
client.commands = new Collection();
client.buttons = new Collection();

// Load commands
const loadCommands = () => {
  const commandFolders = readdirSync(path.join(__dirname, 'commands'));
  
  for (const folder of commandFolders) {
    const commandFiles = readdirSync(path.join(__dirname, 'commands', folder))
      .filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const command = require(path.join(__dirname, 'commands', folder, file));
      
      // Add slash commands
      if (command.data) {
        client.commands.set(command.data.name, command);
      }
      
      // Add prefix commands
      if (command.prefixData) {
        client.prefixCommands = client.prefixCommands || new Collection();
        client.prefixCommands.set(command.prefixData.name, command);
        
        // Add aliases
        if (command.prefixData.aliases) {
          command.prefixData.aliases.forEach(alias => {
            client.prefixCommands.set(alias, command);
          });
        }
      }
    }
  }
};

// Load events
const loadEvents = () => {
  const eventFiles = readdirSync(path.join(__dirname, 'events'))
    .filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const event = require(path.join(__dirname, 'events', file));
    
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
};

// Initialize bot
const initializeBot = async () => {
  try {
    loadCommands();
    loadEvents();
    
    await client.login(process.env.TOKEN);
    console.log(`[SYSTEM] ${client.user.tag} initialized successfully!`);
  } catch (error) {
    console.error('Failed to initialize bot:', error);
    process.exit(1);
  }
};

initializeBot();

// Error handling
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

client.on('guildCreate', require('./events/guildCreate').execute);