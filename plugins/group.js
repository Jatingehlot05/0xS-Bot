module.exports = {
  pattern: ['add', 'kick', 'remove', 'promote', 'demote'],
  desc: 'Group member management',
  isGroup: true,
  isAdmin: true,
  botAdmin: true,
  execute: async (ctx) => {
    const { sock, msg, from, command, args, reply } = ctx;
    
    let users = [];
    
    if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid) {
      users = msg.message.extendedTextMessage.contextInfo.mentionedJid;
    } else if (msg.message.extendedTextMessage?.contextInfo?.participant) {
      users = [msg.message.extendedTextMessage.contextInfo.participant];
    } else if (args[0]) {
      users = [args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'];
    }
    
    if (users.length === 0) {
      return reply('❌ Mention or reply to a user!');
    }
    
    try {
      switch (command) {
        case 'add':
          await sock.groupParticipantsUpdate(from, users, 'add');
          reply(`✅ Added ${users.length} user(s)`);
          break;
        
        case 'kick':
        case 'remove':
          await sock.groupParticipantsUpdate(from, users, 'remove');
          reply(`✅ Removed ${users.length} user(s)`);
          break;
        
        case 'promote':
          await sock.groupParticipantsUpdate(from, users, 'promote');
          reply(`✅ Promoted ${users.length} user(s)`);
          break;
        
        case 'demote':
          await sock.groupParticipantsUpdate(from, users, 'demote');
          reply(`✅ Demoted ${users.length} user(s)`);
          break;
      }
    } catch (err) {
      reply(`❌ Error: ${err.message}`);
    }
  }
};
