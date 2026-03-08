import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const SubmissionSchema = z.object({
    persons: z.number().min(1).max(15),
    areaSqm: z.number().min(10).max(1000),
    yearlyKwh: z.number().min(100).max(50000),
    yearlyEuro: z.number().min(50).max(15000)
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = SubmissionSchema.parse(body);

        // Very basic spam protection (server-side limits can be added via middleware or redis)
        // For now, we just ensure data is valid.

        const submission = await prisma.stromometerSubmission.create({
            data: {
                persons: data.persons,
                areaSqm: data.areaSqm,
                yearlyKwh: data.yearlyKwh,
                yearlyEuro: data.yearlyEuro,
                isSeed: false // explicitly marking as a real human submission
            }
        });

        return NextResponse.json({ success: true, id: submission.id });

    } catch (e: any) {
        return NextResponse.json({ error: 'Invalid submission data', details: e.errors }, { status: 400 });
    }
}
