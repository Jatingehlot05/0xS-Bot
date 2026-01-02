const { getDB } = require('../lib/database');

module.exports = {
  pattern: 'afk',
  desc: 'Set AFK status',
  execute: async (ctx) => {
    const { sender, args, reply } = ctx;
    const db = getDB();
    
    const reason = args.join(' ') || 'No reason';
    db.users.set(sender, { afk: true, reason });
    
    reply(`✅ AFK mode ON\nReason: ${reason}`);
  }
};
