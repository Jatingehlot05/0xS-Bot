const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

const PHONE_NUMBER = process.env.PHONE_NUMBER || '';

console.log('\n╔═══════════════════════════════════════╗');
console.log('║     SESSION GENERATOR FOR PANEL    ║');
console.log('╚═══════════════════════════════════════╝\n');

async function generateSession() {
  if (!PHONE_NUMBER || PHONE_NUMBER.length < 10) {
    console.error('❌ No PHONE_NUMBER found!\n');
    console.log('Please set PHONE_NUMBER in environment:');
    console.log('Example: PHONE_NUMBER=919876543210\n');
    console.log('Or edit this file and add your number at line 7\n');
    process.exit(1);
  }
  
  console.log(`📱 Using number: ${PHONE_NUMBER}\n`);
  console.log('⏳ Initializing...\n');
  
  const authPath = './auth_session';
  if (!fs.existsSync(authPath)) {
    fs.mkdirSync(authPath, { recursive: true });
  }
  
  const { state, saveCreds } = await useMultiFileAuthState(authPath);
  const { version } = await fetchLatestBaileysVersion();
  
  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    browser: ['0xS Bot', 'Chrome', '1.0.0']
  });
  
  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'open') {
      console.log('\n✅ CONNECTED!\n');
      console.log('⏳ Generating SESSION_ID...\n');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const credsPath = path.join(authPath, 'creds.json');
        const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
        
        const sessionData = { creds, version };
        const sessionId = Buffer.from(JSON.stringify(sessionData)).toString('base64');
        
        fs.writeFileSync('./SESSION_ID.txt', sessionId);
        
        console.log('╔═══════════════════════════════════════╗');
        console.log('║    SESSION_ID GENERATED!           ║');
        console.log('╚═══════════════════════════════════════╝\n');
        console.log('✅ Saved to: SESSION_ID.txt\n');
        console.log('📋 Preview (first 80 chars):');
        console.log(sessionId.substring(0, 80) + '...\n');
        console.log('📝 Next steps:\n');
        console.log('1. Run: cat SESSION_ID.txt');
        console.log('2. Copy entire output');
        console.log('3. Add to environment as SESSION_ID');
        console.log('4. Run: npm start\n');
        
        setTimeout(() => process.exit(0), 3000);
        
      } catch (err) {
        console.error('❌ Error generating SESSION_ID:', err.message);
        process.exit(1);
      }
    }
    
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const reason = lastDisconnect?.error?.message;
      
      console.log('\n❌ Connection closed');
      if (reason) {
        console.log('Reason:', reason);
      }
      console.log('\n⚠️  Troubleshooting:\n');
      console.log('1. Check your internet connection');
      console.log('2. Verify PHONE_NUMBER is correct (with country code)');
      console.log('3. Make sure you entered the pairing code in time');
      console.log('4. Try running: npm run session again\n');
      
      process.exit(1);
    }
  });
  
  // Request pairing code if not registered
  if (!sock.authState.creds.registered) {
    console.log('🔄 Requesting pairing code...\n');
    
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(PHONE_NUMBER);
        
        console.log('╔═══════════════════════════════════════╗');
        console.log(`║   PAIRING CODE: ${code}           ║`);
        console.log('╚═══════════════════════════════════════╝\n');
        console.log('⏰ Code expires in 20 seconds!\n');
        console.log('📱 Enter this code in WhatsApp:\n');
        console.log('1. Open WhatsApp');
        console.log('2. Settings → Linked Devices');
        console.log('3. Link with phone number');
        console.log('4. Enter: ' + code + '\n');
        
      } catch (err) {
        console.error('❌ Error requesting pairing code:', err.message);
        process.exit(1);
      }
    }, 3000);
  }
}

generateSession().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
