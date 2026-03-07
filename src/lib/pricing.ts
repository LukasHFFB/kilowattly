export const GLOBAL_ELECTRICITY_PRICE_CENTS = 28;

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
