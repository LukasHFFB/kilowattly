import { Worker, Job } from 'bullmq';
import { redisConnection } from './queue';
import prisma from '../prisma';
import { generateCalculatorLogic, generateSeoContent } from '../openai/generate';

export const worker = new Worker(
    'ingest-keywords',
    async (job: Job) => {
        const { keyword } = job.data;
        console.log(`Processing job ${job.id} for keyword: ${keyword}`);

        // 1. Generate Logic
        const logic = await generateCalculatorLogic(keyword);
        if (!logic) {
            throw new Error('Failed to generate logic');
        }

        // 2. Generate Content
        // We now pass the original keyword as the deviceName since the user guarantees they match.
        const content = await generateSeoContent(keyword, keyword);
        if (!content) {
            throw new Error('Failed to generate content');
        }

        // 3. Save to Database
        const category = await prisma.category.upsert({
            where: { name: logic.category },
            update: {},
            create: { name: logic.category },
        });

        const slug = keyword.toLowerCase().replace(/[^a-z0-9äöüß]+/g, '-').replace(/(^-|-$)+/g, '');

        const calculator = await prisma.calculator.upsert({
            where: { slug },
            update: {
                keyword,
                deviceName: keyword,
                default_wattage: logic.default_wattage,
                average_daily_usage_hours: logic.average_daily_usage_hours,
                seo_content: content.seo_content,
                faqs: JSON.stringify(content.faqs),
                categoryId: category.id,
                status: 'PUBLISHED',
            },
            create: {
                slug,
                keyword,
                deviceName: keyword,
                default_wattage: logic.default_wattage,
                average_daily_usage_hours: logic.average_daily_usage_hours,
                seo_content: content.seo_content,
                faqs: JSON.stringify(content.faqs),
                categoryId: category.id,
                status: 'PUBLISHED',
            },
        });

        console.log(`Successfully processed and saved calculator: ${keyword}`);
        return calculator;
    },
    { connection: redisConnection as any }
);

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with error: ${err.message}`);
});
