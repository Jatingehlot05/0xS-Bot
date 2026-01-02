const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// For panel - use environment variable if available
const PHONE_NUMBER = process.env.PHONE_NUMBER || '';

console.log('\n╔═══════════════════════════════════════════════╗');
console.log('║      LEVANTER-X SESSION GENERATOR              ║');
console.log('║      Get Your Pairing Code Here!               ║');
console.log('╚═══════════════════════════════════════════════╝\n');

async function getPhoneNumber() {
  // If running on panel with env variable
  if (PHONE_NUMBER && PHONE_NUMBER.length > 5) {
    console.log(`📱 Using number from environment: ${PHONE_NUMBER}\n`);
    return PHONE_NUMBER;
  }
  
  // If running locally with terminal input
  if (process.stdin.isTTY) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question('Enter your WhatsApp number (with country code, no +):\nExample: 919876543210\n\nNumber: ', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }
  
  // Fallback - show error
  console.error('❌ No phone number provided!');
  console.log('\nOptions:');
  console.log('1. Set PHONE_NUMBER environment variable in panel');
  console.log('2. Run locally: node session.js');
  console.log('3. Edit session.js and hardcode your number\n');
  process.exit(1);
}

async function generateSession() {
  try {
    const phoneNumber = await getPhoneNumber();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      console.error('❌ Invalid phone number!');
      process.exit(1);
    }
    
    console.log('\n⏳ Initializing...\n');
    
    const authPath = './auth_session';
    if (!fs.existsSync(authPath)) {
      fs.mkdirSync(authPath, { recursive: true });
    }
    
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();
    
    console.log(`📱 Using WhatsApp Web v${version.join('.')}\n`);
    
    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      auth: state,
      browser: ['Levanter-X', 'Chrome', '1.0.0']
    });
    
    // Request pairing code
    if (!sock.authState.creds.registered) {
      console.log('🔄 Requesting pairing code...\n');
      
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(phoneNumber);
          
          console.log('╔═══════════════════════════════════════════════╗');
          console.log(`║                                               ║`);
          console.log(`║         PAIRING CODE: ${code}              ║`);
          console.log(`║                                               ║`);
          console.log('╚═══════════════════════════════════════════════╝\n');
          
          console.log('📱 How to use this code:\n');
          console.log('1. Open WhatsApp on your phone');
          console.log('2. Tap Menu (⋮) or Settings');
          console.log('3. Select "Linked Devices"');
          console.log('4. Tap "Link a Device"');
          console.log('5. Choose "Link with phone number"');
          console.log('6. Enter the code above: ' + code);
          console.log('\n⏰ Code expires in 20 seconds!\n');
          
        } catch (err) {
          console.error('❌ Error requesting pairing code:', err.message);
          process.exit(1);
        }
      }, 3000);
    }
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      
      if (connection === 'open') {
        console.log('\n✅ CONNECTION SUCCESSFUL!\n');
        console.log('⏳ Generating SESSION_ID...\n');
        
        // Wait for credentials to save
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          // Read credentials
          const credsPath = path.join(authPath, 'creds.json');
          
          if (!fs.existsSync(credsPath)) {
            throw new Error('Credentials file not found');
          }
          
          const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
          
          // Create session data
          const sessionData = {
            creds: creds,
            version: version
          };
          
          // Convert to base64
          const sessionId = Buffer.from(JSON.stringify(sessionData)).toString('base64');
          
          // Save to file
          fs.writeFileSync('./SESSION_ID.txt', sessionId);
          
          console.log('╔═══════════════════════════════════════════════╗');
          console.log('║          SESSION ID GENERATED!                 ║');
          console.log('╚═══════════════════════════════════════════════╝\n');
          
          console.log('✅ Your SESSION_ID has been saved to: SESSION_ID.txt\n');
          console.log('📋 SESSION_ID Preview (first 100 characters):');
          console.log(sessionId.substring(0, 100) + '...\n');
          
          console.log('📝 Next Steps:\n');
          console.log('1. Copy the entire SESSION_ID from SESSION_ID.txt');
          console.log('2. Add it to your .env file or panel environment variables');
          console.log('3. Start your bot with: npm start');
          console.log('\n✅ You can now deploy your bot!\n');
          
          // Clean up and exit
          setTimeout(() => {
            console.log('🔚 Exiting session generator...\n');
            process.exit(0);
          }, 3000);
          
        } catch (err) {
          console.error('❌ Error generating session:', err.message);
          process.exit(1);
        }
      }
      
      if (connection === 'close') {
        const shouldReconnect = 
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        
        if (lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut) {
          console.log('\n❌ Session logged out. Please run again.\n');
          process.exit(1);
        }
        
        if (!shouldReconnect) {
          console.log('\n❌ Connection failed. Please try again.\n');
          process.exit(1);
        }
      }
    });
    
  } catch (err) {
    console.error('❌ Fatal Error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start
console.log('🚀 Starting session generator...\n');
generateSession();

