import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Über uns — Wer steckt hinter kilowattly? | kilowattly',
    description:
        'kilowattly bietet kostenlose Stromverbrauch- & Stromkosten-Rechner für 1.000+ Geräte. Erfahren Sie, wer hinter der Plattform steckt und was uns antreibt.',
};

export default function UeberUnsPage() {
    return (
        <>
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

            <main className="max-w-4xl mx-auto px-6 pb-24 flex-grow w-full">
                <section className="mb-10 relative">
                    <div className="absolute -top-10 -left-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 relative z-10">
                        Über <span className="text-brand-600">kilowattly</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl leading-relaxed relative z-10">
                        Transparenz beim Stromverbrauch — für jeden Haushalt.
                    </p>
                </section>

                <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm prose prose-slate max-w-none">
                    <h2>Unsere Mission</h2>
                    <p>
                        Viele wissen nicht, wie viel Strom ihre Geräte tatsächlich verbrauchen — und was das am Ende kostet.
                        Genau hier setzt <strong>kilowattly</strong> an. Wir bieten kostenlose, präzise Stromverbrauchs- und
                        Stromkostenrechner für über 1.000 Haushaltsgeräte. Unser Ziel: volle Transparenz, damit Sie
                        informierte Entscheidungen treffen und bares Geld sparen können.
                    </p>

                    <h2>Was kilowattly auszeichnet</h2>
                    <ul>
                        <li>
                            <strong>Unabhängig &amp; werbefrei:</strong> Unsere Berechnungen basieren auf realen Verbrauchswerten
                            und sind frei von Interessen Dritter.
                        </li>
                        <li>
                            <strong>Gerätegenau:</strong> Jeder Rechner ist individuell auf ein bestimmtes Gerät zugeschnitten —
                            mit passender Wattzahl, typischer Nutzungsdauer und praxisnahen Spartipps.
                        </li>
                        <li>
                            <strong>Ständig wachsend:</strong> Unsere Datenbank wird laufend um neue Geräte und Kategorien
                            erweitert, damit Sie immer den passenden Rechner finden.
                        </li>
                        <li>
                            <strong>Sofort nutzbar:</strong> Kein Login, keine Registrierung, keine versteckten Kosten.
                            Einfach Gerät auswählen und Stromkosten berechnen.
                        </li>
                    </ul>

                    <h2>Wie funktionieren unsere Rechner?</h2>
                    <p>
                        Jeder Rechner verwendet die typische Leistungsaufnahme (in Watt) des jeweiligen Geräts und
                        kombiniert diese mit Ihrer persönlichen Nutzungsdauer und dem aktuellen Strompreis.
                        Daraus berechnen wir den täglichen, monatlichen und jährlichen Stromverbrauch
                        in Kilowattstunden (kWh) sowie die zugehörigen Kosten in Euro.
                    </p>

                    <h2>Wer steckt dahinter?</h2>
                    <p>
                        kilowattly wurde von einem kleinen Team aus Deutschland entwickelt, das sich für
                        Energieeffizienz und transparente Verbraucherinformation begeistert. Wir glauben,
                        dass nachhaltiger Konsum mit dem Wissen über den eigenen Verbrauch beginnt.
                    </p>

                    <h2>Kontakt</h2>
                    <p>
                        Haben Sie Fragen, Feedback oder einen Gerätewunsch? Schreiben Sie uns gerne an{' '}
                        <a href="mailto:kontakt@kilowattly.de">kontakt@kilowattly.de</a>.
                        Wir freuen uns über jede Nachricht!
                    </p>
                </div>
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
