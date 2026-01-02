const config = require('../config');

module.exports = {
  pattern: ['alive', 'status', 'bot'],
  desc: 'Check bot status',
  execute: async (ctx) => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    const status = `*✅ ${config.BOT_NAME} IS ONLINE!*

⏱️ Uptime: ${hours}h ${minutes}m
🤖 Bot: Active
👤 Owner: ${config.OWNER_NAME}
📱 Mode: ${config.MODE}

_Send ${config.PREFIX}menu for commands_`;
    
    await ctx.reply(status);
  }
};
