module.exports = {
  pattern: 'ping',
  desc: 'Check response time',
  execute: async (ctx) => {
    const start = Date.now();
    await ctx.reply('🏓 Pinging...');
    const end = Date.now();
    
    await ctx.reply(`🏓 Pong!\n⚡ Speed: ${end - start}ms`);
  }
};
