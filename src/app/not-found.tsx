import Link from 'next/link';
import SearchBar from './SearchBar';

export default function NotFound() {
    return (
        <>
            <header className="max-w-5xl w-full mx-auto px-6 py-8 flex justify-between items-center bg-transparent">
                <Link href="/" className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 hover:text-brand-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
                        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
                    </svg>
                    kilowattly<span className="text-brand-500">.</span>
                </Link>
                <nav className="hidden sm:flex gap-6 text-sm font-semibold text-slate-600">
                    <Link href="/" className="hover:text-brand-600 transition-colors">Startseite</Link>
                    <Link href="/alle-rechner" className="hover:text-brand-600 transition-colors">Alle Rechner</Link>
                    <Link href="/virtueller-stromzaehler" className="hover:text-brand-600 transition-colors">Virtueller Stromzähler</Link>
                    <Link href="/ueber-uns" className="hover:text-brand-600 transition-colors">Über uns</Link>
                </nav>
            </header>

            <main className="flex-grow max-w-3xl w-full mx-auto px-6 pb-24 pt-10 sm:pt-20 text-center flex flex-col items-center">

                {/* Playful 404 Illustration placeholder or text focus */}
                <div className="text-9xl font-black text-brand-100 mb-6 drop-shadow-sm select-none">
                    404
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                    Huch! Diese Seite steht <span className="text-brand-600">unter Strom</span>, ist aber leider nicht erreichbar.
                </h1>

                <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-2xl">
                    Wir konnten die gesuchte Seite nicht finden. Möglicherweise wurde sie verschoben oder die URL ist fehlerhaft. Suchen Sie doch einfach nach dem gewünschten Gerät:
                </p>

                {/* The Search Bar to keep users engaged */}
                <div className="w-full max-w-xl mb-12 relative z-20">
                    <SearchBar />
                </div>

                {/* Helpful navigation blocks to prevent bounces */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl text-left">
                    <Link href="/" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-400 hover:shadow-md transition-all group">
                        <h3 className="font-bold text-slate-900 group-hover:text-brand-600 flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            Zurück zur Startseite
                        </h3>
                        <p className="text-sm text-slate-500">Finden Sie direkt den Rechner für Ihr gewünschtes Haushaltsgerät.</p>
                    </Link>

                    <Link href="/alle-rechner" className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-400 hover:shadow-md transition-all group">
                        <h3 className="font-bold text-slate-900 group-hover:text-brand-600 flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                            Alle Rechner (A-Z)
                        </h3>
                        <p className="text-sm text-slate-500">Stöbern Sie durch unser komplettes Verzeichnis aller Stromkostenrechner.</p>
                    </Link>
                </div>

            </main>

            <footer className="border-t border-slate-200 bg-white py-10 mt-auto w-full">
                <div className="max-w-5xl mx-auto px-6 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500">
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
