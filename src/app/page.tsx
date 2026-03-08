import Link from 'next/link';
import prisma from '@/lib/prisma';
import SearchBar from './SearchBar';
import { getGlobalElectricityPrice, getElectricityPriceUpdateDate } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const allCalculators = await prisma.calculator.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { slug: 'asc' }, // stable order for deterministic rotation
  });

  // Daily rotation: use the current date as a seed so the selection
  // changes each day but stays stable within the same day.
  const today = new Date();
  const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const total = allCalculators.length;
  const offset = total > 0 ? daySeed % total : 0;
  const popularCalculators = [];
  for (let i = 0; i < Math.min(6, total); i++) {
    popularCalculators.push(allCalculators[(offset + i) % total]);
  }

  // Pick 4 calculators for the "Trending" tags, offset slightly so they are different from the popular grid
  const trendingCalculators = [];
  for (let i = 0; i < Math.min(4, total); i++) {
    trendingCalculators.push(allCalculators[(offset + i + 6) % total]);
  }

  return (
    <>
      {/* Header */}
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
          <Link href="/stromometer" className="hover:text-brand-600 transition-colors">Strom-o-meter Studie</Link>
          <Link href="/ueber-uns" className="hover:text-brand-600 transition-colors">Über uns</Link>
        </nav>
      </header>

      <main className="flex-grow max-w-5xl w-full mx-auto px-6 pb-24 pt-10 sm:pt-20">

        {/* HERO & SEARCH SECTION */}
        <section className="text-center relative mb-20 bg-transparent">
          {/* Decorative Blue Gradient Blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 pt-16">

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6 drop-shadow-sm">
              <span className="text-brand-600">Stromkosten</span> &amp; Stromverbrauch berechnen
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Für über 1.000 Haushaltsgeräte — exakt, kostenlos, sofort. Finde den genauen Stromverbrauch und die jährlichen Stromkosten für jedes Gerät.
            </p>

            {/* Search Bar (Client Component) */}
            <SearchBar />

            {/* Price Freshness Badge */}
            <div className="mt-8 flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                Aktueller Strompreis (Stand {getElectricityPriceUpdateDate().formattedDate}): <strong className="text-slate-900">{getGlobalElectricityPrice()} ct/kWh</strong>
              </div>
            </div>

            {/* Trending Tags */}
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
              <span className="text-slate-500 font-medium pt-1">Oft gesucht:</span>
              {trendingCalculators.map((calc: any) => (
                <Link key={calc.id} href={`/rechner/${calc.slug}`} className="text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-full font-semibold transition-colors">
                  {calc.deviceName}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* POPULAR CALCULATORS GRID */}
        <section className="relative bg-transparent">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Beliebte Stromkostenrechner
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {popularCalculators.length === 0 ? (
              <div className="col-span-full border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500">
                Es sind noch keine Rechner verfügbar. Bitte schauen Sie später wieder vorbei.
              </div>
            ) : null}
            {popularCalculators.map((calc: any) => (
              <Link href={`/rechner/${calc.slug}`} key={calc.id} className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col h-full cursor-pointer">
                <div className="bg-brand-50 w-14 h-14 rounded-xl flex items-center justify-center text-brand-600 mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">{calc.deviceName}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mt-auto">Stromverbrauch & Stromkosten berechnen bei ca. {calc.default_wattage} Watt.</p>
              </Link>
            ))}
          </div>
        </section>

        {/* HERO PRODUCT: VIRTUELLE STROMZÄHLER */}
        <section className="mt-20 relative bg-brand-50 rounded-3xl p-8 sm:p-12 border border-brand-100 overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <svg className="w-64 h-64" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-brand-200">
              <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
              Neu
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Der virtuelle <span className="text-brand-600">Stromzähler</span></h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Bauen Sie Ihren Haushalt digital nach. Fügen Sie Ihre Geräte hinzu, passen Sie Laufzeiten an und finden Sie sofort heraus, wo die <strong className="text-slate-800">versteckten Stromfresser</strong> lauern. 100% kostenlos und ohne Anmeldung.
            </p>
            <Link href="/virtueller-stromzaehler" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm shadow-brand-500/20 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all text-lg">
              Jetzt Haushalt simulieren
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          </div>
        </section>

        {/* STUDY: STROM-O-METER */}
        <section className="mt-8 relative bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-amber-200">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              On-Site Studie
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Das große <span className="text-brand-600 underline decoration-brand-300 underline-offset-4">Strom-o-meter</span></h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Wie viel Strom verbraucht Deutschland wirklich? Nehmen Sie völlig anonym an unserer großen Haushalts-Studie teil und vergleichen Sie Ihre eigene Jahresabrechnung sofort mit dem Bundesdurchschnitt.
            </p>
          </div>
          <div className="shrink-0 relative z-10 w-full md:w-auto">
            <Link href="/stromometer" className="inline-flex items-center justify-center w-full md:w-auto gap-2 px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-sm hover:-translate-y-0.5 transition-all text-lg">
              Jetzt anonym vergleichen
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          </div>
        </section>

      </main>

      <footer className="border-t border-slate-200 bg-white py-10 mt-auto">
        <div className="max-w-5xl mx-auto px-6 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500">
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
    </>
  );
}
