import { NextResponse } from 'next/server';
import { ingestQueue } from '@/lib/queue/queue';

export async function POST(req: Request) {
    try {
        const { keyword } = await req.json();

        if (!keyword) {
            return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
        }

        const job = await ingestQueue.add('process-keyword', { keyword }, {
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
