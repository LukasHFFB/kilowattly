import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function GET(req: Request) {
    // Basic protection to ensure this isn't executed randomly by users in production
    // (An admin API key check should be added here in a real production environment)

    try {
        const existingSeeds = await prisma.stromometerSubmission.count({
            where: { isSeed: true }
        });

        if (existingSeeds > 0) {
            return NextResponse.json({ message: 'Seed data already exists', count: existingSeeds });
        }

        const seedData = [];

        for (let i = 0; i < 150; i++) {
            const persons = getRandomInt(1, 5);
            // Rough estimation for German households
            const baseArea = 30 + (persons * 20);
            const areaSqm = getRandomInt(baseArea - 10, baseArea + 30);

            // Average around 1200 kWh per person + some area base load
            let baseKwh = (persons * 1200) + (areaSqm * 5);
            // Add some noise (e.g. electric heating, old appliances vs new)
            const noise = getRandomInt(-500, 1500);
            const yearlyKwh = Math.max(800, baseKwh + noise);

            // Average 35 to 40 cents
            const priceCents = getRandomInt(32, 42) / 100;
            const yearlyEuro = parseFloat((yearlyKwh * priceCents).toFixed(2));

            seedData.push({
                persons,
                areaSqm,
                yearlyKwh,
                yearlyEuro,
                isSeed: true
            });
        }

        await prisma.stromometerSubmission.createMany({
            data: seedData
        });

        return NextResponse.json({ success: true, inserted: seedData.length });
    } catch (e: any) {
        return NextResponse.json({ error: 'Failed to seed database', details: e.message }, { status: 500 });
    }
}
