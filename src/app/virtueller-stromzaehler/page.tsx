import prisma from '@/lib/prisma';
import Link from 'next/link';
import StromzaehlerApp from './StromzaehlerApp';
import FaqWidget from '../rechner/[slug]/FaqWidget';
import { getGlobalElectricityPrice } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
    const year = new Date().getFullYear();
    return {
        title: `Virtueller Stromzähler: Kosten fürs ganze Haus simulieren (${year})`,
        description: `Berechnen Sie mit dem virtuellen Stromzähler die gesamten Stromkosten Ihres Haushalts. Geräte hinzufügen, Verbrauch simulieren und Kostentreiber identifizieren. 100% kostenlos.`,
    };
}

export default async function VirtuellerStromzaehlerPage() {
    // Fetch all calculators to act as the catalog for the user to pick from
    const allCalculators = await prisma.calculator.findMany({
        where: { status: 'PUBLISHED' },
        select: {
            id: true,
            deviceName: true,
            default_wattage: true,
            average_daily_usage_hours: true,
            price_cents: true
        },
        orderBy: { deviceName: 'asc' }
    });

    const defaultPrice = getGlobalElectricityPrice();

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <header className="max-w-7xl mx-auto px-6 py-8 w-full flex justify-between items-center bg-transparent">
                <Link href="/" className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 hover:text-brand-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2A.5.5 0 0 1 14.9 3l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg>
                    kilowattly<span className="text-brand-500">.</span>
                </Link>
                <nav className="hidden sm:flex gap-6 text-sm font-semibold text-slate-600">
                    <Link href="/" className="hover:text-brand-600 transition-colors">Startseite</Link>
                    <Link href="/alle-rechner" className="hover:text-brand-600 transition-colors">Alle Rechner</Link>
                    <Link href="/virtueller-stromzaehler" className="hover:text-brand-600 transition-colors">Virtueller Stromzähler</Link>
                    <Link href="/stromometer" className="hover:text-brand-600 transition-colors">Strom-o-meter</Link>
                    <Link href="/ueber-uns" className="hover:text-brand-600 transition-colors">Über uns</Link>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 flex-grow w-full">

                {/* Hero Header */}
                <section className="mb-10 text-center sm:text-left relative pt-8">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
                    <div className="absolute -top-10 -left-10 w-64 h-64 bg-slate-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 relative">
                        Der virtuelle <span className="text-brand-600">Stromzähler</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-slate-600 max-w-3xl leading-relaxed relative">
                        Bauen Sie Ihren Haushalt digital nach. Fügen Sie Ihre Geräte hinzu, passen Sie Laufzeiten an und finden Sie sofort heraus, wo die <span className="font-semibold text-slate-800">versteckten Stromfresser</span> lauern.
                    </p>
                </section>

                {/* The Interactive App Sandbox */}
                <StromzaehlerApp catalog={allCalculators} defaultPrice={defaultPrice} />

                {/* Long Form SEO Text */}
                <section className="mt-24 mb-16 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <article className="max-w-4xl text-slate-700 leading-relaxed prose prose-brand prose-headings:text-slate-900 prose-h2:text-3xl prose-h2:font-bold prose-h2:mb-6 prose-p:mb-5 prose-h3:text-2xl prose-h3:font-bold prose-h3:mt-10 prose-h3:mb-4 prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-6 prose-ul:space-y-2 prose-strong:text-slate-900">
                        <h2>Wie funktioniert der virtuelle Stromzähler?</h2>
                        <p>
                            Der virtuelle Stromzähler von kilowattly ist Ihr persönliches Dashboard zur genauen Analyse der Stromkosten in Ihrem Haushalt.
                            Statt sich nur auf die Jahresabrechnung Ihres Energieversorgers zu verlassen, ermöglicht Ihnen dieses Tool eine genaue Aufschlüsselung:
                            Welches Gerät verursacht welche Kosten? Wo liegt das größte Einsparpotenzial?
                        </p>

                        <h3>Schritt 1: Geräte hinzufügen</h3>
                        <p>
                            Nutzen Sie die Suchfunktion oben, um alle elektrischen Geräte auszuwählen, die in Ihrem Haushalt regelmäßig genutzt werden.
                            Von der Küchenausstattung (Kühlschrank, Herd, Kaffeemaschine) über Unterhaltungselektronik (Fernseher, PC, Konsolen) bis hin zur
                            Haustechnik (WLAN-Router, smarte Beleuchtung). Wir bieten eine umfangreiche Datenbank mit realistischen Durchschnittswerten.
                        </p>

                        <h3>Schritt 2: Parameter anpassen</h3>
                        <p>
                            Jeder Haushalt ist individuell! Verändern Sie die Watt-Zahl (Leistung) und die tägliche Nutzungsdauer so, dass sie exakt Ihrem Alltag entsprechen.
                            Haben Sie zwei identische Monitore oder Lampen? Erhöhen Sie einfach die "Anzahl" über den Plus-Button.
                        </p>

                        <h3>Schritt 3: Stromfresser identifizieren</h3>
                        <p>
                            Sobald Sie Ihr Setup konfiguriert haben, visualisieren unsere dynamischen Diagramme Ihre wahren Kosten.
                            Das Kreisdiagramm (Cost Breakdown) zeigt Ihnen sofort, welche Geräteklasse den größten Anteil an Ihrer Stromrechnung ausmacht.
                            Die Balkendiagramme schlüsseln die absolute finanzielle Belastung pro Tag, pro Monat und für das gesamte Jahr auf.
                        </p>

                        <h3>Teilen und Vergleichen</h3>
                        <p>
                            Haben Sie Ihre Berechnung abgeschlossen? Über den "Teilen"-Button können Sie einen speziellen Link generieren, in dem Ihre komplette
                            Konfiguration sicher verschlüsselt ist. Schicken Sie diesen Link an Mitbewohner, Familie oder Partner, damit diese sehen können,
                            welche Auswirkung ihr Nutzungsverhalten hat - 100% anonym, ohne Anmeldung und völlig kostenlos.
                        </p>
                    </article>
                </section>

                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                        <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Häufige Fragen (FAQ)
                    </h2>
                    <div className="space-y-4 max-w-4xl mx-auto">
                        <FaqWidget
                            question="Werden meine eingegebenen Daten gespeichert?"
                            answer="Nein. Alle Berechnungen im virtuellen Stromzähler finden ausschließlich in Ihrem Webbrowser statt. kilowattly speichert keine persönlichen Profile oder Verbrauchsdaten in einer Cloud. Wenn Sie Ihre Konfiguration teilen, werden die Daten lediglich als kodierter Text an die URL angehängt."
                        />
                        <FaqWidget
                            question="Wie genau sind die Durchschnittswerte?"
                            answer="Wir pflegen eine laufend aktualisierte Datenbank, die auf Herstellerangaben und repräsentativen Studien (bspw. vom Umweltbundesamt) basiert. Es handelt sich hierbei um Durchschnittswerte, die Ihnen bei der groben Ersteinschätzung helfen. Da alte Geräte in der Regel deutlich mehr Strom verbrauchen als moderne, können Sie die Wattzahl für jedes Gerät individuell überschreiben."
                        />
                        <FaqWidget
                            question="Was bedeutet der 'Aktuelle Strompreis'?"
                            answer="Wir hinterlegen standardmäßig einen repräsentativen Durchschnittspreis für Neukunden in Deutschland. Da sich die Neukundenpreise monatlich ändern, aktualisieren wir diesen Wert regelmäßig automatisch. Wenn Sie in einem Altvertrag feststecken, können Sie Ihren persönlichen Cent-pro-Kilowattstunde (ct/kWh) Tarif jederzeit manuell im Dashboard anpassen."
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
                        <Link href="/ueber-uns" className="hover:text-brand-600 transition-colors">Über uns</Link>
                        <Link href="/impressum" className="hover:text-brand-600 transition-colors">Impressum</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
