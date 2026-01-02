const config = require('../config');
const { getPlugins } = require('./plugins');

async function handleMessages(sock, messages) {
  for (const msg of messages) {
    try {
      if (!msg.message) continue;
      
      const messageType = Object.keys(msg.message)[0];
      if (['protocolMessage', 'senderKeyDistributionMessage'].includes(messageType)) continue;
      
      const text = msg.message.conversation || 
                   msg.message.extendedTextMessage?.text || 
                   msg.message.imageMessage?.caption || 
                   msg.message.videoMessage?.caption || '';
      
      const from = msg.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
      const sender = msg.key.participant || msg.key.remoteJid;
      const pushname = msg.pushName || 'User';
      
      if (!text.startsWith(config.PREFIX)) continue;
      
      const args = text.slice(config.PREFIX.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();
      
      // Check bot mode
      const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';
      const isSudo = config.SUDO.some(num => sender === num + '@s.whatsapp.net');
      
      if (config.MODE === 'private' && sender !== ownerJid && !isSudo) {
        continue;
      }
      
      if (config.MODE === 'group' && !isGroup) {
        continue;
      }
      
      // Create context
      const ctx = {
        sock,
        msg,
        from,
        sender,
        pushname,
        text,
        args,
        command,
        isGroup,
        reply: async (text) => {
          return await sock.sendMessage(from, { text }, { quoted: msg });
        },
        replyWithMention: async (text, mentions) => {
          return await sock.sendMessage(from, { text, mentions }, { quoted: msg });
        }
      };
      
      // Execute plugins
      const plugins = getPlugins();
      for (const plugin of plugins) {
        const pattern = plugin.pattern;
        let match = false;
        
        if (typeof pattern === 'string') {
          match = command === pattern;
        } else if (pattern instanceof RegExp) {
          match = pattern.test(command);
        } else if (Array.isArray(pattern)) {
          match = pattern.includes(command);
        }
        
        if (!match) continue;
        
        // Check requirements
        if (plugin.isGroup && !isGroup) {
          await ctx.reply('❌ This command only works in groups!');
          break;
        }
        
        if (plugin.isAdmin && isGroup) {
          try {
            const metadata = await sock.groupMetadata(from);
            const participant = metadata.participants.find(p => p.id === sender);
            if (!participant?.admin && sender !== ownerJid && !isSudo) {
              await ctx.reply('❌ This command is only for admins!');
              break;
            }
          } catch (err) {
            console.error('Error checking admin:', err);
          }
        }
        
        if (plugin.botAdmin && isGroup) {
          try {
            const metadata = await sock.groupMetadata(from);
            const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const botParticipant = metadata.participants.find(p => p.id === botJid);
            if (!botParticipant?.admin) {
              await ctx.reply('❌ I need to be admin to use this command!');
              break;
            }
          } catch (err) {
            console.error('Error checking bot admin:', err);
          }
        }
        
        // Execute
        try {
          await plugin.execute(ctx);
        } catch (err) {
          console.error(`Error in ${command}:`, err);
          await ctx.reply(`❌ Error: ${err.message}`);
        }
        
        break;
      }
    } catch (err) {
      console.error('Error handling message:', err);
    }
  }
}

module.exports = { handleMessages };
