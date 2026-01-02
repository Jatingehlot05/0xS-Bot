const fs = require('fs');
const path = require('path');

let plugins = [];
let loaded = false; // Prevent duplicate loading

async function loadPlugins() {
  // If already loaded, return
  if (loaded) {
    console.log('⚠️ Plugins already loaded, skipping...');
    return;
  }
  
  const pluginDir = path.join(__dirname, '../plugins');
  
  if (!fs.existsSync(pluginDir)) {
    console.log('⚠️ Plugins directory not found, creating...');
    fs.mkdirSync(pluginDir, { recursive: true });
    return;
  }
  
  const files = fs.readdirSync(pluginDir).filter(file => file.endsWith('.js'));
  
  if (files.length === 0) {
    console.log('⚠️ No plugins found');
    return;
  }
  
  plugins = []; // Clear before loading
  
  for (const file of files) {
    try {
      delete require.cache[require.resolve(path.join(pluginDir, file))]; // Clear cache
      const plugin = require(path.join(pluginDir, file));
      if (plugin.pattern) {
        plugins.push(plugin);
      }
    } catch (err) {
      console.error(`❌ Error loading ${file}:`, err.message);
    }
  }
  
  loaded = true;
  console.log(`✅ Loaded ${plugins.length} plugins`);
}

function getPlugins() {
  return plugins;
}

module.exports = { loadPlugins, getPlugins };
