const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  reconnectOnError: (err) => {
    console.error('Error de conexión a Redis:', err);
    return true; // Intentar reconectar
  },
  retryStrategy: (times) => {
    // Esperar 2 segundos antes de reintentar
    return Math.min(times * 1000, 10000);
  }
});

const CACHE_SIZE = 5;

// Guardar en caché y manejar LRU
async function cacheData(key, value) {
  await redis.hset('cache', key, JSON.stringify(value));
  await redis.zincrby('cacheAccess', 1, key);

  const cacheKeys = await redis.hkeys('cache');
  if (cacheKeys.length > CACHE_SIZE) {
    const leastUsedKey = await redis.zrange('cacheAccess', 0, 0);
    await redis.hdel('cache', leastUsedKey);
    await redis.zrem('cacheAccess', leastUsedKey);
  }
}

// Obtener datos de la caché
async function getCachedData(key) {
  const data = await redis.hget('cache', key);
  if (data) {
    await redis.zincrby('cacheAccess', 1, key);
    return JSON.parse(data);
  }
  return null;
}
redis.on('connect', () => {
  console.log('Conexión a Redis establecida');
});

redis.on('error', (err) => {
  console.error('Error de conexión a Redis:', err);
});
module.exports = { cacheData, getCachedData };
