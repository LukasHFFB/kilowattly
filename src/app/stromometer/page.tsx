import prisma from '@/lib/prisma';
import Link from 'next/link';
import StromometerApp from './StromometerApp';
import FaqWidget from '../rechner/[slug]/FaqWidget';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
    const year = new Date().getFullYear();
    return {
        title: `Strom-o-meter: Der große Stromkosten-Vergleich (${year})`,
        description: `Wie viel Strom verbraucht Deutschland? Nehmen Sie anonym an unserer großen Stromrechnung-Studie teil und vergleichen Sie sofort Ihren Verbrauch mit dem Durchschnitt.`,
    };
}

// Pre-fetch initial global stats on the server to pass down, avoiding client-side loading spinners initially.
async function getInitialStats() {
    const stats = await prisma.stromometerSubmission.aggregate({
        _avg: { persons: true, areaSqm: true, yearlyKwh: true, yearlyEuro: true },
        _count: { id: true }
    });

    return {
        totalSubmissions: stats._count.id || 0,
        avgPersons: stats._avg.persons || 2.1,
        avgAreaSqm: stats._avg.areaSqm || 90,
        avgYearlyKwh: stats._avg.yearlyKwh || 3100,
        avgYearlyEuro: stats._avg.yearlyEuro || 1100,
    };
}

export default async function StromometerPage() {
    const initialStats = await getInitialStats();

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <header className="max-w-7xl mx-auto px-6 py-8 w-full flex justify-between items-center bg-transparent">
                <Link href="/" className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 hover:text-brand-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2A.5.5 0 0 1 14.9 3l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg>
                    kilowattly<span className="text-brand-500">.</span>
                </Link>
                <nav className="hidden md:flex gap-6 text-sm font-semibold text-slate-600">
                    <Link href="/" className="hover:text-brand-600 transition-colors">Startseite</Link>
                    <Link href="/alle-rechner" className="hover:text-brand-600 transition-colors">Alle Rechner</Link>
                    <Link href="/virtueller-stromzaehler" className="hover:text-brand-600 transition-colors">Virtueller Stromzähler</Link>
                    <Link href="/stromometer" className="text-brand-600 transition-colors">Strom-o-meter</Link>
                </nav>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 flex-grow w-full">

                {/* Hero Header */}
                <section className="mb-10 text-center relative pt-8">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
                    <div className="absolute -top-10 -left-10 w-64 h-64 bg-slate-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold uppercase tracking-wider mb-6">
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                        Interaktive On-Site Studie
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                        Das <span className="text-brand-600 underline decoration-brand-300 underline-offset-4">Strom-o-meter</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                        Wie hoch ist Ihre Stromrechnung wirklich im Vergleich zum nationalen Durchschnitt? Tragen Sie Ihre Daten <strong className="font-semibold text-slate-800">100% anonym</strong> ein und sehen Sie den sofortigen Vergleich.
                    </p>
                </section>

                {/* The Interactive Survey App */}
                <StromometerApp initialStats={initialStats} />

                {/* Privacy & Project Info text */}
                <section className="mt-16 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden text-sm text-slate-600 leading-relaxed">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Über diese Erhebung (Anonymität)</h3>
                    <p className="mb-4">
                        Das Strom-o-meter ist ein kostenloses Community-Projekt von kilowattly.
                        Das Ziel ist es, ein hochaktuelles, realistisches Bild über die tatsächlichen Stromverbräuche und Stromkosten in Deutschland zu zeichnen, abseits von theoretischen Laborwerten.
                    </p>
                    <p>
                        <strong>Ihre Daten sind sicher:</strong> Wir erfassen bei Ihrer Teilnahme weder Name, noch E-Mail-Adresse, noch Ihren Standort. Die vier abgefragten Datenpunkte gehen vollkommen anonym in den globalen Durchschnittspool ein und können niemals auf Sie zurückgeführt werden.
                    </p>
                </section>

                <section className="mt-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Häufige Fragen (FAQ)</h2>
                    <div className="space-y-4">
                        <FaqWidget
                            question="Werden meine persönlichen Daten gespeichert?"
                            answer="Nein. Es werden ausschließlich die vier Kennzahlen (Personen, Fläche, Verbrauch, Kosten) in aggregierter Form gespeichert. Es werden keine IPs oder Identifikatoren verknüpft."
                        />
                        <FaqWidget
                            question="Was passiert bei unrealistischen Werten?"
                            answer="Um die Genauigkeit der Ergebnisse für alle Teilnehmer hochzuhalten, filtern unsere Systeme offensichtliche Tippfehler (Spaßeingaben oder extreme Ausreißer, wie Millionenbeträge) automatisch aus dem Berechnungsdurchschnitt heraus."
                        />
                        <FaqWidget
                            question="Warum variieren die Durchschnittswerte täglich?"
                            answer="Jede neue anonyme Einsendung aktualisiert die globale mathematische Berechnung sofort. Je mehr Menschen teilnehmen, desto präziser und aussagekräftiger wird der landesweite Durchschnitt."
                        />
                    </div>
                </section>
            </main>

            <footer className="border-t border-slate-200 bg-white py-10 w-full mt-auto">
                <div className="max-w-7xl mx-auto px-6 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500">
                    <div className="font-bold text-slate-800 mb-2 sm:mb-0">
                        <Link href="/" className="hover:text-brand-600 transition-colors">kilowattly.</Link>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/" className="hover:text-brand-600 transition-colors">Startseite</Link>
                        <Link href="/alle-rechner" className="hover:text-brand-600 transition-colors">Alle Rechner</Link>
                        <Link href="/virtueller-stromzaehler" className="hover:text-brand-600 transition-colors">Virtueller Stromzähler</Link>
                        <Link href="/stromometer" className="hover:text-brand-600 transition-colors">Strom-o-meter</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
