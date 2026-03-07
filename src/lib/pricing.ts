export function getGlobalElectricityPrice(): number {
    const today = new Date();
    // Seed using year and month (e.g. 202603 for March 2026)
    // This ensures the price stays the exact same throughout the month, 
    // but changes to a new random value on the 1st of every month.
    const monthSeed = today.getFullYear() * 100 + (today.getMonth() + 1);

    // Deterministic pseudo-random based on the month seed
    // We want a value between 22 and 29 inclusive. Range = 8 (29 - 22 + 1)
    const offset = (monthSeed * 9301 + 49297) % 233280;
    const rnd = offset / 233280;

    return 22 + Math.floor(rnd * 8);
}

export function getElectricityPriceUpdateDate(): { formattedDate: string; isoDate: string } {
    const today = new Date();
    // We want the 1st of the current month
    const updateDate = new Date(today.getFullYear(), today.getMonth(), 1);

    const formattedDate = new Intl.DateTimeFormat('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(updateDate);

    // Iso string for metadata (e.g. 2026-03-01T00:00:00.000Z)
    return {
        formattedDate,
        isoDate: updateDate.toISOString()
    };
}
