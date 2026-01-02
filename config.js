require('dotenv').config();

module.exports = {
  SESSION_ID: process.env.SESSION_ID || '',
  PHONE_NUMBER: process.env.PHONE_NUMBER || '',
  PREFIX: process.env.PREFIX || '.',
  BOT_NAME: process.env.BOT_NAME || '0xS Bot',
  OWNER_NUMBER: process.env.OWNER_NUMBER || '',
  OWNER_NAME: process.env.OWNER_NAME || 'Jatin Gehlot',
  MODE: process.env.MODE || 'public',
  WELCOME: process.env.WELCOME === 'false',
  GOODBYE: process.env.GOODBYE === 'false',
  AUTO_READ: process.env.AUTO_READ === 'true',
  SUDO: process.env.SUDO ? process.env.SUDO.split(',').map(n => n.trim()) : []
};
