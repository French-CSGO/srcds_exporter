const dns = require('dns').promises;

const cache = new Map();
const TTL_MS = 60 * 1000;

async function resolve(hostname) {
    const cached = cache.get(hostname);
    if (cached && Date.now() < cached.expires) return cached.ip;

    const result = await dns.lookup(hostname);
    cache.set(hostname, { ip: result.address, expires: Date.now() + TTL_MS });
    return result.address;
}

module.exports = { resolve };
