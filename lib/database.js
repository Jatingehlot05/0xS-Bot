const groups = new Map();
const users = new Map();
const warnings = new Map();

async function initDatabase() {
  console.log('📂 In-memory database initialized');
  return Promise.resolve();
}

function getDB() {
  return {
    groups,
    users,
    warnings
  };
}

module.exports = { initDatabase, getDB };
