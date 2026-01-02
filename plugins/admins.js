module.exports = {
  pattern: ['admins', 'adminlist'],
  desc: 'List group admins',
  isGroup: true,
  execute: async (ctx) => {
    const { sock, from } = ctx;
    
    try {
      const metadata = await sock.groupMetadata(from);
      const admins = metadata.participants.filter(p => p.admin);
      
      let text = `*👑 GROUP ADMINS*\n\n`;
      admins.forEach((admin, i) => {
        const role = admin.admin === 'superadmin' ? '👑' : '⚡';
        text += `${i + 1}. ${role} @${admin.id.split('@')[0]}\n`;
      });
      
      await sock.sendMessage(from, {
        text,
        mentions: admins.map(a => a.id)
      });
    } catch (err) {
      ctx.reply(`❌ Error: ${err.message}`);
    }
  }
};
