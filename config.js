require('dotenv').config();

module.exports = {
  SESSION_ID: process.env.SESSION_ID || '',
  PREFIX: process.env.PREFIX || '.',
  BOT_NAME: process.env.BOT_NAME || '0xS Bot',
  OWNER_NUMBER: process.env.OWNER_NUMBER || '919664413727',
  OWNER_NAME: process.env.OWNER_NAME || 'IAMJ',
  MODE: process.env.MODE || 'public',
  WELCOME: process.env.WELCOME === 'true',
  GOODBYE: process.env.GOODBYE === 'false',
  AUTO_READ: process.env.AUTO_READ === 'false',
  AUTO_STATUS_VIEW: process.env.AUTO_STATUS_VIEW === 'false',
  SUDO: process.env.SUDO ? process.env.SUDO.split(',').map(n => n.trim()) : []
};
