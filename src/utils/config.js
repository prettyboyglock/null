require('dotenv').config();

module.exports = {
  TOKEN: process.env.TOKEN,
  CHANNELS: {
    JOIN: process.env.JOIN_CHANNEL_ID,
    BAN: process.env.BAN_CHANNEL_ID,
    LOG: process.env.LOG_CHANNEL_ID,
    TICKETS: process.env.TICKET_CATEGORY_NAME
  },
  COLORS: {
    SUCCESS: '#00FF00',
    ERROR: '#FF0000',
    WARNING: '#FFA500',
    INFO: '#00AAFF'
  }
};

module.exports = {
  COLORS: {
    DEFAULT: '#2F3136',
    SUCCESS: '#00FF00',
    ERROR: '#FF0000',
    WARNING: '#FFA500',
    INFO: '#00BFFF'
  }
};

module.exports = {
  // Add these to your existing config
  REPORT_CHANNEL_ID: '1336121948693987338',
  MOD_ROLE_ID: '1330817172003356694'
};

module.exports = {
  // Your other configurations...

  // Raid log channel ID
  raidLogChannelId: '1336159752685748295' // Replace with the actual channel ID
};

module.exports = {
  // Other configurations...

  welcomeChannelId: '1336161032363704340', // Replace with your actual welcome channel ID
  goodbyeChannelId: '1336161064789737494', // Replace with your actual goodbye channel ID
};

