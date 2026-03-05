import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        const results = await prisma.calculator.findMany({
            where: {
                status: 'PUBLISHED',
                OR: [
                    { deviceName: { contains: query, mode: 'insensitive' } },
                    { keyword: { contains: query, mode: 'insensitive' } },
                    { slug: { contains: query.toLowerCase() } },
                ],
            },
            select: {
                slug: true,
                deviceName: true,
                default_wattage: true,
                keyword: true,
            },
            take: 8,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ results: [] });
    }
}
