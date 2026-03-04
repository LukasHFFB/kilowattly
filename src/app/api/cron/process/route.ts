import { NextResponse } from 'next/server';
import { ingestQueue } from '@/lib/queue/queue';
import { generateCalculatorLogic, generateSeoContent } from '@/lib/openai/generate';
import prisma from '@/lib/prisma';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // Basic Security: Vercel sends an authorization header for cron jobs
    // You should set CRON_SECRET in your Vercel Environment Variables and verify it here
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // console.warn('Unauthorized cron invocation attempt');
        // Uncomment the above and below in production once CRON_SECRET is set
        // return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // Fetch up to 5 waiting jobs
        const limit = 5;
        const jobs = await ingestQueue.getWaiting(0, limit - 1);

        if (jobs.length === 0) {
            return NextResponse.json({ message: 'No jobs in queue' });
        }

        const processed = [];
        const failed = [];

        for (const job of jobs) {
            const keyword = job.data.keyword;
            try {
                // 1. Generate Logic
                const logic = await generateCalculatorLogic(keyword);
                if (!logic) throw new Error('Failed to generate logic');

                // 2. Generate Content
                const content = await generateSeoContent(keyword, logic.device_name);
                if (!content) throw new Error('Failed to generate content');

                // 3. Save to Database
                const category = await prisma.category.upsert({
                    where: { name: logic.category },
                    update: {},
                    create: { name: logic.category },
                });

                const slug = logic.device_name.toLowerCase().replace(/[^a-z0-9äöüß]+/g, '-').replace(/(^-|-$)+/g, '');

                await prisma.calculator.upsert({
                    where: { slug },
                    update: {
                        keyword,
                        deviceName: logic.device_name,
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
                        deviceName: logic.device_name,
                        default_wattage: logic.default_wattage,
                        average_daily_usage_hours: logic.average_daily_usage_hours,
                        seo_content: content.seo_content,
                        faqs: JSON.stringify(content.faqs),
                        categoryId: category.id,
                        status: 'PUBLISHED',
                    },
                });

                await job.remove();
                processed.push(keyword);
            } catch (err: any) {
                console.error(`Error processing job for ${keyword}:`, err);
                failed.push({ keyword, error: err.message });
                // We keep the job in the queue (or let BullMQ handle retry limits if properly configured) 
                // For this custom script, we might want to move it to failed state manually:
                await job.moveToFailed(err, 'cron-token', true);
            }
        }

        return NextResponse.json({
            success: true,
            processedCount: processed.length,
            failedCount: failed.length,
            processed,
            failed
        });

    } catch (error: any) {
        console.error('Cron Processor Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
