module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`
      
      
      
      ${client.user.tag} is online and ready!
      
      
      
      `);

    // ASCII Art
    console.log(`
                    @@@@                              @@@                     
                  @@@@@@                              @@@@@@                  
                  @@@@                                  @@@@                  
                  @@@@     @@@@   @@@@@       @@@@@     @@@@                  
                  @@@@     @@@@@@@@@@@@@@@    @@@@@     @@@@                  
                @@@@@      @@@@@@    @@@@@    @@@@@     @@@@@@                
                @@@@@      @@@@@      @@@@              @@@@@@                
                  @@@@     @@@@@      @@@@              @@@@                  
                  @@@@     @@@@@      @@@@    @@@@@     @@@@                  
                  @@@@     @@@@@      @@@@   @@@@@      @@@@                  
                  @@@@@@                     @@@@     @@@@@@                  
                    @@@@                              @@@@         
                    
                    



    `);

    // Get a list of all the commands
    const commandList = [];
    client.commands.forEach(command => {
      if (command.data && command.data.name) {
        commandList.push(`/${command.data.name}: ${command.data.description || 'No description'}`);
      }
    });

    // Join the command list into one string and log it
    console.log('List of all available commands:\n' + commandList.join('\n'));

    // Bot Invite Link
    const botInviteLink = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`;
    console.log(`
      
      
      
      
      
      
      Invite the bot using this link: ${botInviteLink}`);





  }
};

