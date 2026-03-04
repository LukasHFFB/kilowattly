import { NextResponse } from 'next/server';
import { ingestQueue } from '@/lib/queue/queue';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            ingestQueue.getWaitingCount(),
            ingestQueue.getActiveCount(),
            ingestQueue.getCompletedCount(),
            ingestQueue.getFailedCount(),
            ingestQueue.getDelayedCount()
        ]);

        return NextResponse.json({ waiting, active, completed, failed, delayed });
    } catch (error) {
        console.error('Error fetching queue status:', error);
        return NextResponse.json({ error: 'Failed to fetch queue status' }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        await ingestQueue.obliterate({ force: true });
        return NextResponse.json({ success: true, message: 'Warteschlange geleert' });
    } catch (error) {
        console.error('Error clearing queue:', error);
        return NextResponse.json({ error: 'Failed to clear queue' }, { status: 500 });
    }
}
