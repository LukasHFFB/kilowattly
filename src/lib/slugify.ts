/**
 * Generates a URL-safe slug from a string.
 * Transliterates German umlauts (ä→ae, ö→oe, ü→ue, ß→ss) and strips
 * all non-alphanumeric characters, replacing them with hyphens.
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}
