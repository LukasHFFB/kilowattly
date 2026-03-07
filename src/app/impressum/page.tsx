import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Impressum | kilowattly',
    robots: { index: true, follow: true },
};

export default function ImpressumPage() {
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
                    <Link href="/virtueller-stromzaehler" className="hover:text-brand-600 transition-colors">Virtueller Stromzähler</Link>
                    <Link href="/ueber-uns" className="hover:text-brand-600 transition-colors">Über uns</Link>
                </nav>
            </header>

            <main className="max-w-4xl mx-auto px-6 pb-24 flex-grow w-full">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-8">Impressum</h1>

                <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm prose prose-slate max-w-none">
                    <h2>Angaben gemäß § 5 TMG</h2>
                    <p>
                        <strong>Lukas Hoffbauer</strong><br />
                        Aboulevard 59B<br />
                        1960 Frederiksberg C<br />
                        Dänemark
                    </p>

                    <h2>Kontakt</h2>
                    <p>
                        E-Mail: <a href="mailto:info@kilowattly.de">info@kilowattly.de</a>
                    </p>

                    <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
                    <p>
                        <strong>Lukas Hoffbauer</strong><br />
                        Aboulevard 59B<br />
                        1960 Frederiksberg C
                    </p>

                    <h2>Haftungsausschluss</h2>
                    <h3>Haftung für Inhalte</h3>
                    <p>
                        Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                    </p>

                    <h3>Haftung für Links</h3>
                    <p>
                        Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                    </p>

                    <h3>Urheberrecht</h3>
                    <p>
                        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                    </p>

                    <h2>Streitschlichtung</h2>
                    <p>
                        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>. Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
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
                        <Link href="/virtueller-stromzaehler" className="hover:text-brand-600 transition-colors">Virtueller Stromzähler</Link>
                        <Link href="/ueber-uns" className="hover:text-brand-600 transition-colors">Über uns</Link>
                        <Link href="/impressum" className="hover:text-brand-600 transition-colors">Impressum</Link>
                    </div>
                </div>
            </footer>
        </>
    );
}
