module.exports = {
  pattern: ['groupinfo', 'ginfo', 'gcinfo'],
  desc: 'Get group information',
  isGroup: true,
  execute: async (ctx) => {
    const { sock, from, reply } = ctx;
    
    try {
      const metadata = await sock.groupMetadata(from);
      const admins = metadata.participants.filter(p => p.admin).length;
      const members = metadata.participants.length;
      const desc = metadata.desc || 'No description';
      
      const info = `*📋 GROUP INFO*

*Name:* ${metadata.subject}
*Members:* ${members}
*Admins:* ${admins}
*Created:* ${new Date(metadata.creation * 1000).toLocaleDateString()}
*Description:* ${desc}`;
      
      reply(info);
    } catch (err) {
      reply(`❌ Error: ${err.message}`);
    }
  }
};
