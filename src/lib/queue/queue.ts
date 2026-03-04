import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Fallback seamlessly to the KV_URL provided automatically by Vercel Upstash integration
const redisUrl = process.env.REDIS_URL || process.env.KV_URL || 'redis://localhost:6379';
export const redisConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
});

export const ingestQueue = new Queue('ingest-keywords', { connection: redisConnection as any });
