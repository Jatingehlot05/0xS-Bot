const { getDB } = require('../lib/database');

module.exports = {
  pattern: 'welcome',
  desc: 'Toggle welcome messages',
  isGroup: true,
  isAdmin: true,
  execute: async (ctx) => {
    const { from, args, reply } = ctx;
    const db = getDB();
    
    const group = db.groups.get(from) || {};
    
    if (args[0] === 'on') {
      group.welcome = true;
      db.groups.set(from, group);
      reply('✅ Welcome messages enabled!');
    } else if (args[0] === 'off') {
      group.welcome = false;
      db.groups.set(from, group);
      reply('❌ Welcome messages disabled!');
    } else {
      reply(`Usage: .welcome on/off\nCurrent: ${group.welcome ? 'ON' : 'OFF'}`);
    }
  }
};
