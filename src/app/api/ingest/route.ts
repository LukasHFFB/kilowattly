import { NextResponse } from 'next/server';
import { ingestQueue } from '@/lib/queue/queue';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/slugify';

export async function POST(req: Request) {
    try {
        const { keyword } = await req.json();

        if (!keyword) {
            return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
        }

        const normalizedKeyword = keyword.trim().toLowerCase();

        // 1. Check if a calculator with this keyword (or matching slug) already exists
        const existingCalc = await prisma.calculator.findFirst({
            where: {
                OR: [
                    { keyword: { equals: normalizedKeyword, mode: 'insensitive' } },
                    { slug: slugify(normalizedKeyword) },
                ],
            },
            select: { slug: true, deviceName: true },
        });

        if (existingCalc) {
            return NextResponse.json(
                { error: `Rechner für "${existingCalc.deviceName}" existiert bereits.` },
                { status: 409 }
            );
        }

        // 2. Check if the same keyword is already waiting in the queue
        const waitingJobs = await ingestQueue.getWaiting(0, 200);
        const isDuplicate = waitingJobs.some(
            (job) => job.data.keyword?.trim().toLowerCase() === normalizedKeyword
        );

        if (isDuplicate) {
            return NextResponse.json(
                { error: `"${keyword}" ist bereits in der Warteschlange.` },
                { status: 409 }
            );
        }

        const job = await ingestQueue.add('process-keyword', { keyword: normalizedKeyword }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });

        return NextResponse.json({ message: 'Job queued successfully', jobId: job.id }, { status: 202 });
    } catch (error) {
        console.error('Error queueing job:', error);
        return NextResponse.json({ error: 'Failed to queue job' }, { status: 500 });
    }
}
