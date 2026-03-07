import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const calculators = await prisma.calculator.findMany({
            select: {
                deviceName: true,
            },
            orderBy: {
                deviceName: 'asc',
            },
        });

        const keywords = calculators.map(c => c.deviceName);
        const textContent = keywords.join('\n');

        return new NextResponse(textContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Content-Disposition': 'attachment; filename="kilowattly_keywords.txt"',
            },
        });
    } catch (error) {
        console.error('Failed to export keywords:', error);
        return new NextResponse('Error generating export', { status: 500 });
    }
}
