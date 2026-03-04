import { NextResponse } from 'next/server';
import { ingestQueue } from '@/lib/queue/queue';
import { generateCalculatorLogic, generateSeoContent } from '@/lib/openai/generate';
import prisma from '@/lib/prisma';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        // Find the first waiting job
        const jobs = await ingestQueue.getWaiting(0, 0);
        if (jobs.length === 0) {
            return NextResponse.json({ message: 'Keine Jobs in der Warteschlange' }, { status: 404 });
        }

        const job = jobs[0];
        const keyword = job.data.keyword;

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

        // Remove the job from the queue since we processed it manually
        await job.remove();

        return NextResponse.json({ success: true, processed: keyword });
    } catch (error: any) {
        console.error('Error processing manual job:', error);
        return NextResponse.json({ error: error.message || 'Failed to process job' }, { status: 500 });
    }
}
