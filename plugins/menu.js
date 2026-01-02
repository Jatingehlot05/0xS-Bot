const config = require('../config');

module.exports = {
  pattern: ['menu', 'help', 'commands'],
  desc: 'Show command list',
  execute: async (ctx) => {
    const { reply, pushname } = ctx;
    
    const menu = `╭━━━『 *${config.BOT_NAME}* 』━━━╮
│ 
│ *👋 Hi, ${pushname}!*
│ *Prefix:* ${config.PREFIX}
│ *Mode:* ${config.MODE}
│ 
├━━━『 GROUP ADMIN 』━━━
│ • ${config.PREFIX}add
│ • ${config.PREFIX}kick
│ • ${config.PREFIX}promote
│ • ${config.PREFIX}demote
│ • ${config.PREFIX}mute
│ • ${config.PREFIX}unmute
│ • ${config.PREFIX}tagall
│ • ${config.PREFIX}hidetag
│ • ${config.PREFIX}warn
│ • ${config.PREFIX}setname
│ • ${config.PREFIX}setdesc
│ • ${config.PREFIX}welcome on/off
│ • ${config.PREFIX}goodbye on/off
│ 
├━━━『 GROUP INFO 』━━━
│ • ${config.PREFIX}groupinfo
│ • ${config.PREFIX}admins
│ 
├━━━『 GENERAL 』━━━
│ • ${config.PREFIX}alive
│ • ${config.PREFIX}ping
│ • ${config.PREFIX}afk
│ 
╰━━━━━━━━━━━━━━━━━╯

_Type ${config.PREFIX}help <command> for details_`;
    
    await reply(menu);
  }
};
