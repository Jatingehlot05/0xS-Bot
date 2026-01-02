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
      const isGroup = from?.endsWith('@g.us');
      const sender = msg.key.participant || msg.key.remoteJid;
      const pushname = msg.pushName || 'User';
      
      if (!text.startsWith(config.PREFIX)) continue;
      
      const args = text.slice(config.PREFIX.length).trim().split(/ +/);
      const command = args.shift()?.toLowerCase();
      
      if (!command) continue;
      
      // Check permissions
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
          try {
            return await sock.sendMessage(from, { text }, { quoted: msg });
          } catch (err) {
            console.error('Reply error:', err.message);
          }
        }
      };
      
      // Find and execute plugin
      const plugins = getPlugins();
      for (const plugin of plugins) {
        try {
          const pattern = plugin.pattern;
          let match = false;
          
          if (typeof pattern === 'string') {
            match = command === pattern;
          } else if (Array.isArray(pattern)) {
            match = pattern.includes(command);
          }
          
          if (!match) continue;
          
          // Check group requirement
          if (plugin.isGroup && !isGroup) {
            await ctx.reply('❌ This command only works in groups!');
            break;
          }
          
          // Check admin requirement
          if (plugin.isAdmin && isGroup) {
            try {
              const metadata = await sock.groupMetadata(from);
              const participant = metadata.participants.find(p => p.id === sender);
              if (!participant?.admin && sender !== ownerJid && !isSudo) {
                await ctx.reply('❌ Admin only command!');
                break;
              }
            } catch (err) {
              console.error('Admin check error:', err.message);
            }
          }
          
          // Check bot admin requirement
          if (plugin.botAdmin && isGroup) {
            try {
              const metadata = await sock.groupMetadata(from);
              const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
              const botParticipant = metadata.participants.find(p => p.id === botJid);
              if (!botParticipant?.admin) {
                await ctx.reply('❌ I need admin rights!');
                break;
              }
            } catch (err) {
              console.error('Bot admin check error:', err.message);
            }
          }
          
          // Execute plugin
          await plugin.execute(ctx);
          break;
          
        } catch (err) {
          console.error(`Plugin error in ${command}:`, err.message);
          try {
            await ctx.reply(`❌ Error: ${err.message}`);
          } catch {}
        }
      }
    } catch (err) {
      console.error('Message handling error:', err.message);
    }
  }
}

module.exports = { handleMessages };
