const makeWASocket = require('@whiskeysockets/baileys').default;
const { 
  useMultiFileAuthState, 
  DisconnectReason, 
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore 
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const { loadPlugins } = require('./lib/plugins');
const { handleMessages } = require('./lib/message');
const { initDatabase } = require('./lib/database');

async function loadSession() {
  const authPath = './auth';
  
  if (!fs.existsSync(authPath)) {
    fs.mkdirSync(authPath, { recursive: true });
  }
  
  if (config.SESSION_ID && config.SESSION_ID.length > 50) {
    try {
      console.log('📂 Loading session from SESSION_ID...');
      const sessionData = JSON.parse(
        Buffer.from(config.SESSION_ID, 'base64').toString('utf8')
      );
      
      fs.writeFileSync(
        path.join(authPath, 'creds.json'), 
        JSON.stringify(sessionData.creds, null, 2)
      );
      
      console.log('✅ Session loaded!');
    } catch (err) {
      console.error('❌ Invalid SESSION_ID:', err.message);
      process.exit(1);
    }
  }
  
  return await useMultiFileAuthState(authPath);
}

async function startBot() {
  console.log('🚀 Starting 0xS Bot...');
  
  await initDatabase();
  
  const { state, saveCreds } = await loadSession();
  const { version } = await fetchLatestBaileysVersion();
  
  console.log(`📱 Using WA v${version.join('.')}`);
  
  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    browser: ['Levanter-X', 'Chrome', '1.0.0'],
    markOnlineOnConnect: true
  });
  
  await loadPlugins();
  
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'close') {
      const shouldReconnect = 
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      
      console.log('Connection closed:', shouldReconnect ? 'Reconnecting...' : 'Logged out');
      
      if (shouldReconnect) {
        setTimeout(() => startBot(), 3000);
      } else {
        process.exit(1);
      }
    } else if (connection === 'open') {
      console.log('✅ Bot connected!');
      console.log(`📱 Number: ${sock.user.id.split(':')[0]}`);
    }
  });
  
  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type === 'notify') {
      await handleMessages(sock, messages);
    }
  });
  
  // Welcome/Goodbye
  sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update;
    
    try {
      const metadata = await sock.groupMetadata(id);
      
      for (const participant of participants) {
        if (action === 'add' && config.WELCOME) {
          await sock.sendMessage(id, { 
            text: `👋 Welcome to *${metadata.subject}*!\n\n@${participant.split('@')[0]}`,
            mentions: [participant]
          });
        } else if (action === 'remove' && config.GOODBYE) {
          await sock.sendMessage(id, { 
            text: `👋 Goodbye @${participant.split('@')[0]}`,
            mentions: [participant]
          });
        }
      }
    } catch (err) {
      console.error('Error in group update:', err);
    }
  });
  
  if (config.AUTO_READ) {
    sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        if (msg.key?.remoteJid) {
          await sock.readMessages([msg.key]);
        }
      }
    });
  }
  
  return sock;
}

process.on('unhandledRejection', err => console.error('Unhandled:', err));
process.on('uncaughtException', err => console.error('Uncaught:', err));

startBot().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
