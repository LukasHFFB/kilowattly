import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import CalculatorWidget from './CalculatorWidget';
import FaqWidget from './FaqWidget';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const calculator = await prisma.calculator.findUnique({ where: { slug } });
    if (!calculator) return {};

    return {
        title: `Stromverbrauch ${calculator.deviceName} Berechnen - kilowattly`,
        description: `Kalkuliere exakt den Stromverbrauch und die Kosten deines ${calculator.deviceName}.`,
    };
}

export default async function CalculatorPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const calculator = await prisma.calculator.findUnique({ where: { slug } });
    if (!calculator) notFound();

    let faqs = [];
    try {
        faqs = JSON.parse(calculator.faqs);
    } catch (e) { }

    return (
        <>
            <header className="max-w-4xl mx-auto px-6 py-8 w-full flex bg-transparent">
                <Link href="/" className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2 hover:text-brand-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2A.5.5 0 0 1 14.9 3l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg>
                    kilowattly<span className="text-brand-500">.</span>
                </Link>
            </header>

            <main className="max-w-4xl mx-auto px-6 pb-24 flex-grow w-full">

                <section className="mb-10 text-center sm:text-left relative">
                    <div className="absolute -top-10 -left-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 relative z-10">
                        Stromverbrauch <span className="text-brand-600">{calculator.deviceName}</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl leading-relaxed relative z-10">
                        Ermitteln Sie präzise den Energiebedarf und die laufenden Kosten. Passen Sie die Werte an die Spezifikationen für Ihr {calculator.deviceName} an.
                    </p>
                </section>

                <CalculatorWidget
                    defaultWattage={calculator.default_wattage}
                    defaultHours={calculator.average_daily_usage_hours}
                    defaultPrice={calculator.price_cents}
                    deviceName={calculator.deviceName}
                />

                <section className="mb-16 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
                    <article
                        className="max-w-3xl text-slate-700 leading-relaxed prose prose-brand prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-6 prose-p:mb-5 prose-h3:text-xl prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4 prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-6 prose-ul:space-y-2 prose-strong:text-slate-900"
                        dangerouslySetInnerHTML={{ __html: calculator.seo_content }}
                    />
                </section>

                {faqs.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                            <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Häufige Fragen (FAQ)
                        </h2>
                        <div className="space-y-4">
                            {faqs.map((faq: any, idx: number) => (
                                <FaqWidget key={idx} question={faq.question} answer={faq.answer} />
                            ))}
                        </div>
                    </section>
                )}

            </main>

            <footer className="border-t border-slate-200 bg-white py-10 mt-12 w-full">
                <div className="max-w-4xl mx-auto px-6 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500">
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
