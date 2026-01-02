module.exports = {
  pattern: ['mute', 'unmute', 'lock', 'unlock'],
  desc: 'Group settings',
  isGroup: true,
  isAdmin: true,
  botAdmin: true,
  execute: async (ctx) => {
    const { sock, from, command, reply } = ctx;
    
    try {
      if (['mute', 'lock'].includes(command)) {
        await sock.groupSettingUpdate(from, 'announcement');
        reply('🔒 Group locked. Only admins can send messages.');
      } else {
        await sock.groupSettingUpdate(from, 'not_announcement');
        reply('🔓 Group unlocked. Everyone can send messages.');
      }
    } catch (err) {
      reply(`❌ Error: ${err.message}`);
    }
  }
};
