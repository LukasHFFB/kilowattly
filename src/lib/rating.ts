export function getSeedRating(slug: string): { rating: number; count: number } {
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
        hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
    }
    const seed = Math.abs(hash);

    // Generate a deterministic rating between 4.5 and 4.9
    // Range: 0.4. Base: 4.5. Math: 4.5 + (seed % 50) / 100
    const ratingRaw = 4.5 + (seed % 41) / 100; // 4.50 to 4.90
    const rating = Math.round(ratingRaw * 10) / 10;

    // Generate a deterministic count between 12 and 67
    const count = 12 + (seed % 56);

    return { rating, count };
}

export function getCombinedRating(
    seedRating: number,
    seedCount: number,
    realSum: number,
    realCount: number
): { average: number; totalCount: number } {
    const seedSum = seedRating * seedCount;
    const totalSum = seedSum + realSum;
    const totalCount = seedCount + realCount;

    const rawAverage = totalSum / totalCount;
    // Round to 1 decimal place (e.g. 4.7)
    const average = Math.round(rawAverage * 10) / 10;

    return { average, totalCount };
}
