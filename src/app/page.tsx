import Link from 'next/link';
import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export default async function Home() {
  const popularCalculators = await prisma.calculator.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

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
          <Link href="#" className="hover:text-brand-600 transition-colors">Kategorien</Link>
          <Link href="#" className="hover:text-brand-600 transition-colors">Über uns</Link>
        </nav>
      </header>

      <main className="flex-grow max-w-5xl w-full mx-auto px-6 pb-24 pt-10 sm:pt-20">

        {/* HERO & SEARCH SECTION */}
        <section className="text-center relative mb-20 bg-transparent">
          {/* Decorative Blue Gradient Blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
              Was kostet dein <span className="text-brand-600">Strom?</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Finde den exakten Stromverbrauch und die Kosten für über 1.000 Geräte im Haushalt, Garten und Büro.
            </p>

            {/* Big Search Bar */}
            <form className="relative group max-w-2xl mx-auto" action="#">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <svg className="w-6 h-6 text-slate-400 group-focus-within:text-brand-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input type="text"
                name="q"
                className="block w-full pl-14 pr-32 py-5 sm:py-6 bg-white border-2 border-slate-200 rounded-2xl text-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all"
                placeholder="Z.B. Gartensauna, Gaming PC, Kühlschrank..."
                required />
              <button type="submit" className="absolute right-2.5 bottom-2.5 top-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl px-6 transition-colors shadow-sm">
                Suchen
              </button>
            </form>

            {/* Trending Tags */}
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
              <span className="text-slate-500 font-medium pt-1">Oft gesucht:</span>
              <Link href="/rechner/klimaanlage" className="text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-full font-semibold transition-colors">Klimaanlage</Link>
              <Link href="/rechner/waermepumpe" className="text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-full font-semibold transition-colors">Wärmepumpe</Link>
              <Link href="/rechner/aquarium" className="text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-full font-semibold transition-colors">Aquarium</Link>
              <Link href="/rechner/e-bike-akku" className="text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-full font-semibold transition-colors">E-Bike Akku</Link>
            </div>
          </div>
        </section>

        {/* POPULAR CALCULATORS GRID */}
        <section className="relative z-10 bg-transparent">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Beliebte Stromrechner
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {popularCalculators.length === 0 ? (
              <div className="col-span-full border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500">
                Es sind noch keine Rechner verfügbar. Bitte fügen Sie via API neue Geräte hinzu.
              </div>
            ) : null}
            {popularCalculators.map((calc: any) => (
              <Link href={`/rechner/${calc.slug}`} key={calc.id} className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col h-full cursor-pointer">
                <div className="bg-brand-50 w-14 h-14 rounded-xl flex items-center justify-center text-brand-600 mb-5 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">{calc.deviceName}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mt-auto">Kalkulieren Sie den Strombedarf bei ca. {calc.default_wattage} Watt.</p>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/kategorien" className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors">
              Alle Kategorien durchsuchen
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>
            </Link>
          </div>
        </section>

      </main>

      <footer className="border-t border-slate-200 bg-white py-10 mt-auto">
        <div className="max-w-5xl mx-auto px-6 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500">
          <div className="font-bold text-slate-800 mb-2 sm:mb-0">
            kilowattly.
          </div>
          <div>
            &copy; {new Date().getFullYear()} Alle Rechte vorbehalten. kilowattly.
          </div>
        </div>
      </footer>
    </>
  );
}
