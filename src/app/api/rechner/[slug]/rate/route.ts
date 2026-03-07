import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ slug: string }> } // Await params for Next.js 15
) {
    try {
        const { slug } = await params;
        const body = await request.json();

        const score = Number(body.score);

        // Basic validation
        if (!score || isNaN(score) || score < 1 || score > 5) {
            return NextResponse.json({ error: 'Invalid score. Must be between 1 and 5' }, { status: 400 });
        }

        // Verify calculator exists
        const calculator = await prisma.calculator.findUnique({
            where: { slug },
            select: { id: true, realRatingCount: true, realRatingSum: true }
        });

        if (!calculator) {
            return NextResponse.json({ error: 'Calculator not found' }, { status: 404 });
        }

        // Increment the real user ratings in the database atomically
        const updated = await prisma.calculator.update({
            where: { slug },
            data: {
                realRatingCount: { increment: 1 },
                realRatingSum: { increment: score }
            },
            select: {
                realRatingCount: true,
                realRatingSum: true
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Vielen Dank für Ihre Bewertung!',
            newStats: updated
        }, { status: 200 });

    } catch (error) {
        console.error('Rating update failed:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
