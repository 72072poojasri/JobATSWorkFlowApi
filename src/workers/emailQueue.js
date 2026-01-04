const { Queue } = require('bullmq');
const redis = require('../config/redis');

let emailQueue;

if (redis && typeof redis.isConnected === 'function' && redis.isConnected()) {
  emailQueue = new Queue('email-notifications', {
    connection: redis.client,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    },
  });
} else {
  // Degraded no-op queue: logs jobs instead of pushing to Redis
  emailQueue = {
    add: async (name, data, opts) => {
      console.warn('[EMAIL QUEUE] Redis unavailable — job not queued. Job type:', name);
      console.info('[EMAIL QUEUE] Job payload:', data);
      return { id: `noop-${Date.now()}` };
    },
  };
}

module.exports = emailQueue;
