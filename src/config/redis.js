// Resilient Redis client: do not crash the app if Redis is unavailable.
// Exports an object with `client` (or null) and `isConnected` flag.
let redisClient = null;
let isConnected = false;

try {
  const redis = require('redis');

  const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
  });

  client.on('error', (err) => {
    // Avoid noisy errors in development; log important info in other envs
    if (process.env.NODE_ENV !== 'development') {
      console.error('Redis Client Error:', err.message || err);
    }
  });

  client.on('connect', () => {
    isConnected = true;
    console.log('✓ Redis connected successfully');
  });

  // Attempt to connect but don't let failures crash the process
  client.connect().then(() => {
    isConnected = true;
  }).catch((err) => {
    isConnected = false;
    if (process.env.NODE_ENV !== 'development') {
      console.error('Failed to connect to Redis (non-fatal):', err.message || err);
    } else {
      console.warn('Redis not available; running in degraded mode (emails/queues disabled).');
    }
  });

  redisClient = client;
} catch (err) {
  // If `redis` package is missing or some other error, continue without Redis.
  console.warn('Redis client not initialized; running in degraded mode (emails/queues disabled).');
}

module.exports = {
  client: redisClient,
  isConnected: () => !!isConnected,
};
