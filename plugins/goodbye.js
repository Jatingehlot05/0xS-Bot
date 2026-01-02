const { getDB } = require('../lib/database');

module.exports = {
  pattern: 'goodbye',
  desc: 'Toggle goodbye messages',
  isGroup: true,
  isAdmin: true,
  execute: async (ctx) => {
    const { from, args, reply } = ctx;
    const db = getDB();
    
    const group = db.groups.get(from) || {};
    
    if (args[0] === 'on') {
      group.goodbye = true;
      db.groups.set(from, group);
      reply('✅ Goodbye messages enabled!');
    } else if (args[0] === 'off') {
      group.goodbye = false;
      db.groups.set(from, group);
      reply('❌ Goodbye messages disabled!');
    } else {
      reply(`Usage: .goodbye on/off\nCurrent: ${group.goodbye ? 'ON' : 'OFF'}`);
    }
  }
};
