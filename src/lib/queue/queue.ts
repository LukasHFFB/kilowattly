import { Queue } from 'bullmq';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
});

export const ingestQueue = new Queue('ingest-keywords', { connection: redisConnection as any });
