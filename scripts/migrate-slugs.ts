/**
 * One-off migration script to re-slug existing calculators.
 * Converts umlauted slugs (e.g. "badlüfter") to ASCII equivalents ("badluefter").
 *
 * Usage:  npx tsx scripts/migrate-slugs.ts
 */

import { PrismaClient } from '@prisma/client';

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

async function main() {
    const prisma = new PrismaClient();

    try {
        const calculators = await prisma.calculator.findMany({
            select: { id: true, slug: true, deviceName: true },
        });

        let updated = 0;
        let skipped = 0;

        for (const calc of calculators) {
            const newSlug = slugify(calc.deviceName);

            if (newSlug === calc.slug) {
                skipped++;
                continue;
            }

            // Check for conflicts before updating
            const existing = await prisma.calculator.findUnique({
                where: { slug: newSlug },
            });

            if (existing && existing.id !== calc.id) {
                console.warn(
                    `⚠️  CONFLICT: "${calc.slug}" → "${newSlug}" already taken by ID ${existing.id}. Skipping.`
                );
                skipped++;
                continue;
            }

            await prisma.calculator.update({
                where: { id: calc.id },
                data: { slug: newSlug },
            });

            console.log(`✅  "${calc.slug}" → "${newSlug}"`);
            updated++;
        }

        console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
