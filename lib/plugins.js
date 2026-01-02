const fs = require('fs');
const path = require('path');

const plugins = [];

async function loadPlugins() {
  const pluginDir = path.join(__dirname, '../plugins');
  
  if (!fs.existsSync(pluginDir)) {
    fs.mkdirSync(pluginDir, { recursive: true });
    console.log('📁 Created plugins directory');
    return;
  }
  
  const files = fs.readdirSync(pluginDir).filter(file => file.endsWith('.js'));
  
  for (const file of files) {
    try {
      const plugin = require(path.join(pluginDir, file));
      if (plugin.pattern) {
        plugins.push(plugin);
        console.log(`✅ Loaded: ${file}`);
      }
    } catch (err) {
      console.error(`❌ Error loading ${file}:`, err.message);
    }
  }
  
  console.log(`✅ Loaded ${plugins.length} plugins`);
}

function getPlugins() {
  return plugins;
}

module.exports = { loadPlugins, getPlugins };
