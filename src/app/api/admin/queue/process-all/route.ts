import { NextResponse } from 'next/server';
import { ingestQueue } from '@/lib/queue/queue';
import { generateCalculatorLogic, generateSeoContent } from '@/lib/openai/generate';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/slugify';

export const maxDuration = 300; // 5 minutes max for Vercel Pro, 60 for Hobby
export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const jobs = await ingestQueue.getWaiting(0, 49); // Grab up to 50 at a time
        if (jobs.length === 0) {
            return NextResponse.json({ message: 'Keine Jobs in der Warteschlange', processed: 0 });
        }

        const processed: string[] = [];
        const failed: { keyword: string; error: string }[] = [];

        for (const job of jobs) {
            const keyword = job.data.keyword;
            try {
                const logic = await generateCalculatorLogic(keyword);
                if (!logic) throw new Error('Logic generation failed');

                const content = await generateSeoContent(keyword, keyword);
                if (!content) throw new Error('Content generation failed');

                const category = await prisma.category.upsert({
                    where: { name: logic.category },
                    update: {},
                    create: { name: logic.category },
                });

                const slug = slugify(keyword);

                await prisma.calculator.upsert({
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

                await job.remove();
                processed.push(keyword);
            } catch (err: any) {
                console.error(`Failed: ${keyword}`, err);
                failed.push({ keyword, error: err.message });
                try { await job.moveToFailed(err, 'batch-token', true); } catch (_) { }
            }
        }

        return NextResponse.json({
            success: true,
            processedCount: processed.length,
            failedCount: failed.length,
            processed,
            failed,
        });
    } catch (error: any) {
        console.error('Batch process error:', error);
        return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
    }
}
