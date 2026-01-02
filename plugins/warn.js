const { getDB } = require('../lib/database');

module.exports = {
  pattern: 'warn',
  desc: 'Warn a user',
  isGroup: true,
  isAdmin: true,
  botAdmin: true,
  execute: async (ctx) => {
    const { sock, msg, from, args, sender } = ctx;
    const db = getDB();
    
    let user;
    if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid) {
      user = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (msg.message.extendedTextMessage?.contextInfo?.participant) {
      user = msg.message.extendedTextMessage.contextInfo.participant;
    } else {
      return ctx.reply('❌ Mention or reply to a user!');
    }
    
    const reason = args.join(' ') || 'No reason';
    const key = `${from}_${user}`;
    const count = (db.warnings.get(key) || 0) + 1;
    
    if (count >= 3) {
      await sock.groupParticipantsUpdate(from, [user], 'remove');
      db.warnings.delete(key);
      await sock.sendMessage(from, {
        text: `⚠️ @${user.split('@')[0]} kicked after 3 warnings!`,
        mentions: [user]
      });
    } else {
      db.warnings.set(key, count);
      await sock.sendMessage(from, {
        text: `⚠️ Warning ${count}/3\n\n@${user.split('@')[0]}\nReason: ${reason}`,
        mentions: [user]
      });
    }
  }
};
