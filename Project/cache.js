const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  reconnectOnError: (err) => {
    console.error('Error de conexión a Redis:', err);
    return true;
  },
  retryStrategy: (times) => Math.min(times * 1000, 10000)
});

const CACHE_SIZE = 5;

async function cacheData(key, value) {
  try {
    await redis.hset('cache', key, JSON.stringify(value));
    await redis.zincrby('cacheAccess', 1, key);

    const cacheKeys = await redis.hkeys('cache');
    if (cacheKeys.length > CACHE_SIZE) {
      const leastUsedKey = await redis.zrange('cacheAccess', 0, 0);
      if (leastUsedKey.length > 0) {
        await redis.hdel('cache', leastUsedKey[0]);
        await redis.zrem('cacheAccess', leastUsedKey[0]);
      }
    }
  } catch (error) {
    console.error("Error al guardar en caché:", error);
  }
}

async function getCachedData(key) {
  try {
    const data = await redis.hget('cache', key);
    if (data) {
      await redis.zincrby('cacheAccess', 1, key);
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error("Error al obtener datos de la caché:", error);
    return null;
  }
}

async function getTopSearchedUsers() {
  try {
    const topUsers = await redis.zrevrange('cacheAccess', 0, CACHE_SIZE - 1, 'WITHSCORES');
    const result = [];
    for (let i = 0; i < topUsers.length; i += 2) {
      const id = topUsers[i];
      const searchCount = topUsers[i + 1];
      const userData = await redis.hget('cache', id);
      if (userData) {
        result.push({ id, ...JSON.parse(userData), searchCount });
      }
    }
    return result;
  } catch (error) {
    console.error("Error al obtener los usuarios más buscados:", error);
    return [];
  }
}

module.exports = {redis, cacheData, getCachedData, getTopSearchedUsers };
