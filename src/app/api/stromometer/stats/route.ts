import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const stats = await prisma.stromometerSubmission.aggregate({
            _avg: {
                persons: true,
                areaSqm: true,
                yearlyKwh: true,
                yearlyEuro: true
            },
            _count: {
                id: true
            }
        });

        // Add some safety checks if no records exist
        const defaultStats = {
            totalSubmissions: stats._count.id || 0,
            avgPersons: stats._avg.persons || 2.1,
            avgAreaSqm: stats._avg.areaSqm || 90,
            avgYearlyKwh: stats._avg.yearlyKwh || 3100,
            avgYearlyEuro: stats._avg.yearlyEuro || 1100,
        };

        return NextResponse.json(defaultStats);
    } catch (e: any) {
        return NextResponse.json({ error: 'Failed to fetch global stats' }, { status: 500 });
    }
}
