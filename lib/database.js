const db = {
  groups: new Map(),
  users: new Map(),
  warnings: new Map()
};

async function initDatabase() {
  console.log('✅ Database initialized');
  return Promise.resolve();
}

function getDB() {
  return db;
}

module.exports = { initDatabase, getDB };

