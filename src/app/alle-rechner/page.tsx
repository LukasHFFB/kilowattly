import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const count = await prisma.calculator.count({ where: { status: 'PUBLISHED' } });
    return {
        title: `Alle ${count}+ Stromverbrauchsrechner im Überblick | kilowattly`,
        description: `${count} kostenlose Stromverbrauchsrechner auf einen Blick ⚡ Finden Sie Ihr Gerät und berechnen Sie Stromverbrauch & Stromkosten — alphabetisch sortiert.`,
    };
}

export default async function AlleRechnerPage() {
    const calculators = await prisma.calculator.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, deviceName: true, default_wattage: true },
        orderBy: { deviceName: 'asc' },
    });

    // Group calculators by first letter for an alphabetical directory
    const grouped = new Map<string, typeof calculators>();
    for (const calc of calculators) {
        const letter = calc.deviceName.charAt(0).toUpperCase();
        if (!grouped.has(letter)) grouped.set(letter, []);
        grouped.get(letter)!.push(calc);
    }
    const sortedLetters = [...grouped.keys()].sort();

    return (
        <>
            <header className="max-w-5xl mx-auto px-6 py-8 w-full flex justify-between items-center bg-transparent">
                <Link href="/" className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 hover:text-brand-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2A.5.5 0 0 1 14.9 3l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg>
                    kilowattly<span className="text-brand-500">.</span>
                </Link>
                <nav className="hidden sm:flex gap-6 text-sm font-semibold text-slate-600">
                    <Link href="/alle-rechner" className="hover:text-brand-600 transition-colors">Alle Rechner</Link>
                    <Link href="/ueber-uns" className="hover:text-brand-600 transition-colors">Über uns</Link>
                </nav>
            </header>

            <main className="max-w-5xl mx-auto px-6 pb-24 flex-grow w-full">

                {/* Hero Section */}
                <section className="mb-12 relative">
                    <div className="absolute -top-10 -left-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 relative z-10">
                        Alle <span className="text-brand-600">Stromverbrauchsrechner</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl leading-relaxed relative z-10">
                        {calculators.length} Rechner für Haushaltsgeräte — alphabetisch sortiert. Klicken Sie auf ein Gerät, um Stromverbrauch und Stromkosten zu berechnen.
                    </p>
                </section>

                {/* Letter Jump Navigation */}
                <nav className="mb-8 flex flex-wrap gap-2" aria-label="Alphabetische Navigation">
                    {sortedLetters.map((letter) => (
                        <a
                            key={letter}
                            href={`#letter-${letter}`}
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-600 transition-all"
                        >
                            {letter}
                        </a>
                    ))}
                </nav>

                {/* Grouped Calculator List */}
                <div className="space-y-10">
                    {sortedLetters.map((letter) => (
                        <section key={letter} id={`letter-${letter}`}>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                                <span className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 font-extrabold">
                                    {letter}
                                </span>
                                <span className="text-slate-300 text-base font-normal">
                                    {grouped.get(letter)!.length} {grouped.get(letter)!.length === 1 ? 'Rechner' : 'Rechner'}
                                </span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {grouped.get(letter)!.map((calc) => (
                                    <Link
                                        key={calc.slug}
                                        href={`/rechner/${calc.slug}`}
                                        className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all flex items-center justify-between"
                                    >
                                        <div>
                                            <span className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                                                {calc.deviceName}
                                            </span>
                                            <span className="text-slate-400 text-sm ml-2">
                                                ({calc.default_wattage} W)
                                            </span>
                                        </div>
                                        <svg className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {calculators.length === 0 && (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500">
                        Es sind noch keine Rechner verfügbar.
                    </div>
                )}
            </main>

            <footer className="border-t border-slate-200 bg-white py-10 mt-12 w-full">
                <div className="max-w-5xl mx-auto px-6 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500">
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
