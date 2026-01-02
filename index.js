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

let isReconnecting = false; // Prevent multiple reconnections

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
      
      console.log('✅ Session loaded');
    } catch (err) {
      console.error('❌ Invalid SESSION_ID:', err.message);
      console.log('\n⚠️ Please generate SESSION_ID:');
      console.log('1. Set PHONE_NUMBER in environment');
      console.log('2. Run: npm run session');
      console.log('3. Add SESSION_ID to environment\n');
      process.exit(1);
    }
  } else {
    console.log('⚠️ No SESSION_ID found. Please run: npm run session');
  }
  
  return await useMultiFileAuthState(authPath);
}

async function startBot() {
  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║        0xS BOT STARTING...         ║');
  console.log('╚═══════════════════════════════════════╝\n');
  
  await initDatabase();
  
  const { state, saveCreds } = await loadSession();
  const { version } = await fetchLatestBaileysVersion();
  
  console.log(`📱 WhatsApp v${version.join('.')}`);
  
  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    browser: ['0xS Bot', 'Chrome', '1.0.0'],
    markOnlineOnConnect: true,
    defaultQueryTimeoutMs: undefined
  });
  
  // Load plugins ONCE
  await loadPlugins();
  
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      
      console.log('\n❌ Connection closed');
      console.log('Reason:', lastDisconnect?.error?.message || 'Unknown');
      console.log('Will reconnect:', shouldReconnect);
      
      if (shouldReconnect && !isReconnecting) {
        isReconnecting = true;
        console.log('⏳ Reconnecting in 3 seconds...\n');
        setTimeout(() => {
          isReconnecting = false;
          startBot();
        }, 3000);
      } else if (statusCode === DisconnectReason.loggedOut) {
        console.log('\n⚠️ Session logged out!');
        console.log('Please generate new SESSION_ID:\n');
        console.log('1. Run: npm run session');
        console.log('2. Update SESSION_ID in environment\n');
        process.exit(1);
      }
    } else if (connection === 'open') {
      console.log('\n✅ BOT CONNECTED!');
      console.log(`📱 Number: ${sock.user.id.split(':')[0]}`);
      console.log(`👤 Name: ${sock.user.name || 'Unknown'}`);
      console.log(`🔧 Mode: ${config.MODE}`);
      console.log(`⚙️ Prefix: ${config.PREFIX}\n`);
    } else if (connection === 'connecting') {
      console.log('🔄 Connecting...');
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
            text: `👋 Welcome @${participant.split('@')[0]}!`,
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
      console.error('Group update error:', err.message);
    }
  });
  
  if (config.AUTO_READ) {
    sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        if (msg.key?.remoteJid) {
          await sock.readMessages([msg.key]).catch(() => {});
        }
      }
    });
  }
  
  return sock;
}

// Error handling
process.on('unhandledRejection', err => {
  console.error('Unhandled rejection:', err.message);
});

process.on('uncaughtException', err => {
  console.error('Uncaught exception:', err.message);
});

// Start
startBot().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
