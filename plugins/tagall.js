module.exports = {
  pattern: ['tagall', 'all', 'everyone'],
  desc: 'Tag all group members',
  isGroup: true,
  isAdmin: true,
  execute: async (ctx) => {
    const { sock, from, args } = ctx;
    
    try {
      const metadata = await sock.groupMetadata(from);
      const participants = metadata.participants.map(p => p.id);
      
      const message = args.join(' ') || '📢 Attention Everyone!';
      
      let text = `*${message}*\n\n`;
      participants.forEach((jid, i) => {
        text += `${i + 1}. @${jid.split('@')[0]}\n`;
      });
      
      await sock.sendMessage(from, { text, mentions: participants });
    } catch (err) {
      ctx.reply(`❌ Error: ${err.message}`);
    }
  }
};
