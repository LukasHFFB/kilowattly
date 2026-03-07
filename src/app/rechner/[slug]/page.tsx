import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import FaqWidget from './FaqWidget';
import CalculatorSection from './CalculatorSection';
import ShareInfographic from './ShareInfographic';
import { getGlobalElectricityPrice, getElectricityPriceUpdateDate } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const calculator = await prisma.calculator.findUnique({ where: { slug } });
    if (!calculator) return {};

    const year = new Date().getFullYear();
    const device = calculator.deviceName;
    const watt = calculator.default_wattage;

    const currentCost = Math.round((calculator.default_wattage * calculator.average_daily_usage_hours * 365) / 1000 * (getGlobalElectricityPrice() / 100));

    const allOtherCalculators = await prisma.calculator.findMany({
        where: { status: 'PUBLISHED', slug: { not: slug } },
        select: { deviceName: true, default_wattage: true, average_daily_usage_hours: true, price_cents: true },
    });

    const WELL_KNOWN = ['Kühlschrank', 'Waschmaschine', 'Fernseher', 'Staubsauger', 'WLAN-Router', 'Geschirrspüler'];
    const wellKnownMatches = allOtherCalculators.filter((c) =>
        WELL_KNOWN.some((name) => c.deviceName.toLowerCase().includes(name.toLowerCase()))
    );
    const otherCalcs = allOtherCalculators.filter((c) =>
        !WELL_KNOWN.some((name) => c.deviceName.toLowerCase().includes(name.toLowerCase()))
    );
    const comparisonPool = [...wellKnownMatches, ...otherCalcs];

    const ogComparisons = comparisonPool.slice(0, 4).map((c) => ({
        n: c.deviceName,
        c: Math.round((c.default_wattage * c.average_daily_usage_hours * 365) / 1000 * (getGlobalElectricityPrice() / 100)),
    }));

    const ogUrl = `https://www.kilowattly.de/api/og/rechner?name=${encodeURIComponent(device)}&cost=${currentCost}&comps=${encodeURIComponent(JSON.stringify(ogComparisons))}&v=2`;

    return {
        title: `${device}: Stromverbrauch & Stromkosten berechnen (${year}) | kilowattly`,
        description: `Was kostet ein ${device} (${watt} W) an Strom pro Monat & Jahr? ⚡ Berechnen Sie jetzt Stromkosten, kWh-Jahresverbrauch & Sparpotenzial — kostenloser Rechner mit Spartipps.`,
        openGraph: {
            type: 'article',
            modifiedTime: getElectricityPriceUpdateDate().isoDate,
            images: [
                {
                    url: ogUrl,
                    width: 1200,
                    height: 630,
                    alt: `Infografik: Stromkosten ${device} im Vergleich`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            images: [ogUrl],
        },
    };
}

export default async function CalculatorPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const calculator = await prisma.calculator.findUnique({ where: { slug } });
    if (!calculator) notFound();

    let faqs = [];
    try {
        faqs = JSON.parse(calculator.faqs);
    } catch (e) { }

    // Fetch ALL other published calculators for fair internal linking
    const allOtherCalculators = await prisma.calculator.findMany({
        where: {
            status: 'PUBLISHED',
            slug: { not: slug },
        },
        select: { slug: true, deviceName: true, default_wattage: true, average_daily_usage_hours: true, price_cents: true },
        orderBy: { slug: 'asc' }, // stable order for deterministic rotation
    });

    // Deterministic rotation: hash the current slug to pick an offset,
    // so each page shows a different set of 4 calculators.
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
        hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
    }
    const total = allOtherCalculators.length;
    const offset = total > 0 ? ((hash % total) + total) % total : 0;
    const relatedCalculators = [];
    for (let i = 0; i < Math.min(4, total); i++) {
        relatedCalculators.push(allOtherCalculators[(offset + i) % total]);
    }

    // Build comparison chart data from real DB values:
    // Try to find well-known household devices first, fill with others if needed
    const WELL_KNOWN = ['Kühlschrank', 'Waschmaschine', 'Fernseher', 'Staubsauger', 'WLAN-Router', 'Geschirrspüler'];

    // Pick well-known ones first, then fill from the rest
    const wellKnownMatches = allOtherCalculators.filter((c) =>
        WELL_KNOWN.some((name) => c.deviceName.toLowerCase().includes(name.toLowerCase()))
    );
    const otherCalcs = allOtherCalculators.filter((c) =>
        !WELL_KNOWN.some((name) => c.deviceName.toLowerCase().includes(name.toLowerCase()))
    );
    const comparisonPool = [...wellKnownMatches, ...otherCalcs];
    const comparisonDevices = comparisonPool.slice(0, 5).map((c) => ({
        name: c.deviceName,
        watt: c.default_wattage,
        hoursPerDay: c.average_daily_usage_hours,
        priceCents: getGlobalElectricityPrice(),
    }));

    const currentCost = Math.round((calculator.default_wattage * calculator.average_daily_usage_hours * 365) / 1000 * (getGlobalElectricityPrice() / 100));
    const ogComparisons = comparisonDevices.slice(0, 4).map((c) => ({
        n: c.name,
        c: Math.round((c.watt * c.hoursPerDay * 365) / 1000 * (getGlobalElectricityPrice() / 100)),
    }));
    const ogUrl = `/api/og/rechner?name=${encodeURIComponent(calculator.deviceName)}&cost=${currentCost}&comps=${encodeURIComponent(JSON.stringify(ogComparisons))}&v=2`;

    // JSON-LD BreadcrumbList for schema.org structured data
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Startseite',
                item: 'https://www.kilowattly.de',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: `${calculator.deviceName} Stromkosten`,
                item: `https://www.kilowattly.de/rechner/${slug}`,
            },
        ],
    };

    // JSON-LD FAQPage for schema.org structured data
    const faqJsonLd = faqs.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq: any) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    } : null;

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {faqJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
                />
            )}

            <header className="max-w-4xl mx-auto px-6 py-8 w-full flex justify-between items-center bg-transparent">
                <Link href="/" className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 hover:text-brand-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2A.5.5 0 0 1 14.9 3l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg>
                    kilowattly<span className="text-brand-500">.</span>
                </Link>
                <nav className="hidden sm:flex gap-6 text-sm font-semibold text-slate-600">
                    <Link href="/" className="hover:text-brand-600 transition-colors">Startseite</Link>
                    <Link href="/alle-rechner" className="hover:text-brand-600 transition-colors">Alle Rechner</Link>
                    <Link href="/ueber-uns" className="hover:text-brand-600 transition-colors">Über uns</Link>
                </nav>
            </header>

            {/* Remove hidden figure since we now show it inline */}

            <main className="max-w-4xl mx-auto px-6 pb-24 flex-grow w-full">

                {/* Breadcrumb Navigation */}
                <nav className="mb-6 text-sm text-slate-500" aria-label="Breadcrumb">
                    <ol className="flex items-center gap-1.5">
                        <li><Link href="/" className="hover:text-brand-600 transition-colors">Startseite</Link></li>
                        <li className="text-slate-300">/</li>
                        <li className="text-slate-800 font-medium">{calculator.deviceName} Stromkosten</li>
                    </ol>
                </nav>

                <section className="mb-10 text-center sm:text-left relative">
                    <div className="absolute -top-10 -left-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 relative z-10">
                        Stromverbrauch &amp; Stromkosten <span className="text-brand-600">{calculator.deviceName}</span> berechnen
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl leading-relaxed relative z-10">
                        Ermitteln Sie präzise den Energiebedarf und die laufenden Stromkosten beim {calculator.deviceName}. Passen Sie Wattzahl und Nutzungsdauer individuell an.
                    </p>
                </section>

                <CalculatorSection
                    deviceName={calculator.deviceName}
                    defaultWattage={calculator.default_wattage}
                    defaultHours={calculator.average_daily_usage_hours}
                    defaultPrice={getGlobalElectricityPrice()}
                    priceUpdateDate={getElectricityPriceUpdateDate().formattedDate}
                    comparisons={comparisonDevices}
                />

                <section className="mb-16 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">

                    <article
                        className="max-w-3xl text-slate-700 leading-relaxed prose prose-brand prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-6 prose-p:mb-5 prose-h3:text-xl prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4 prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-6 prose-ul:space-y-2 prose-strong:text-slate-900"
                        dangerouslySetInnerHTML={{ __html: calculator.seo_content }}
                    />
                </section>

                {faqs.length > 0 && (
                    <section className="mb-16">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Häufige Fragen zum Stromverbrauch
                        </h2>
                        <div className="space-y-4">
                            {faqs.map((faq: any, idx: number) => (
                                <FaqWidget key={idx} question={faq.question} answer={faq.answer} />
                            ))}
                        </div>
                    </section>
                )}

                <ShareInfographic
                    ogUrl={ogUrl}
                    deviceName={calculator.deviceName}
                    pageUrl={`https://www.kilowattly.de/rechner/${slug}`}
                />

                {/* Internal Linking: Related Calculators */}
                {relatedCalculators.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Weitere Stromkostenrechner
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {relatedCalculators.map((rc) => (
                                <Link
                                    key={rc.slug}
                                    href={`/rechner/${rc.slug}`}
                                    className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all flex items-center justify-between"
                                >
                                    <div>
                                        <span className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">{rc.deviceName}</span>
                                        <span className="text-slate-400 text-sm ml-2">({rc.default_wattage} W)</span>
                                    </div>
                                    <svg className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

            </main>

            <footer className="border-t border-slate-200 bg-white py-10 mt-12 w-full">
                <div className="max-w-4xl mx-auto px-6 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500">
                    <div className="font-bold text-slate-800 mb-2 sm:mb-0">
                        <Link href="/" className="hover:text-brand-600 transition-colors">kilowattly.</Link>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/" className="hover:text-brand-600 transition-colors">Startseite</Link>
                        <Link href="/alle-rechner" className="hover:text-brand-600 transition-colors">Alle Rechner</Link>
                        <Link href="/ueber-uns" className="hover:text-brand-600 transition-colors">Über uns</Link>
                        <Link href="/impressum" className="hover:text-brand-600 transition-colors">Impressum</Link>
                    </div>
                </div>
            </footer>
        </>
    );
}
