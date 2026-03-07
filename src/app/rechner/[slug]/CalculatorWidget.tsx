'use client';
import { useState, useEffect } from 'react';

export default function CalculatorWidget({ defaultWattage, defaultHours, defaultPrice, deviceName, priceUpdateDate, onValuesChange }: any) {
    const [watt, setWatt] = useState(defaultWattage);
    const [hours, setHours] = useState(defaultHours);
    const [price, setPrice] = useState(defaultPrice);

    const [costs, setCosts] = useState({
        kwhYear: 0,
        costYear: 0,
        costMonth: 0,
    });

    useEffect(() => {
        const kw = watt / 1000;
        const kwhPerDay = kw * hours;
        const kwhPerYear = kwhPerDay * 365;

        const priceEuro = price / 100;
        const costPerYear = kwhPerYear * priceEuro;
        const costPerMonth = costPerYear / 12;

        setCosts({
            kwhYear: kwhPerYear,
            costYear: costPerYear,
            costMonth: costPerMonth
        });

        if (onValuesChange) {
            onValuesChange({ watt, hours, price });
        }
    }, [watt, hours, price, onValuesChange]);

    const currencyFormatter = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const numberFormatter = new Intl.NumberFormat('de-DE', {
        maximumFractionDigits: 0
    });

    return (
        <section className="mb-12">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden flex flex-col md:flex-row">

                {/* Inputs Area (Light) */}
                <div className="p-8 sm:p-10 md:w-3/5 bg-white">
                    <div className="space-y-6">

                        {/* Input 1 */}
                        <div className="group">
                            <label htmlFor="watt" className="block text-sm font-semibold text-slate-700 mb-2 group-focus-within:text-brand-600 transition-colors">Leistung (in Watt)</label>
                            <div className="relative">
                                <input type="number" id="watt" value={watt} onChange={(e) => setWatt(Number(e.target.value))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-600 font-bold bg-brand-50 px-2.5 py-1 rounded-md">W</span>
                            </div>
                        </div>

                        {/* Input 2 */}
                        <div className="flex gap-4">
                            <div className="w-1/2 group">
                                <label htmlFor="hours" className="block text-sm font-semibold text-slate-700 mb-2 group-focus-within:text-brand-600 transition-colors">Nutzung/Tag</label>
                                <div className="relative">
                                    <input type="number" id="hours" value={hours} step="0.1" onChange={(e) => setHours(Number(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-600 font-bold bg-brand-50 px-2.5 py-1 rounded-md">h</span>
                                </div>
                            </div>

                            {/* Input 3 */}
                            <div className="w-1/2 group">
                                <label htmlFor="price" className="block text-sm font-semibold text-slate-700 mb-2 group-focus-within:text-brand-600 transition-colors">Strompreis</label>
                                <div className="relative">
                                    <input type="number" id="price" value={price} step="0.1" onChange={(e) => setPrice(Number(e.target.value))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-600 font-bold bg-brand-50 px-2.5 py-1 rounded-md">ct</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Results Area (Dark) */}
                <div className="p-8 sm:p-10 md:w-2/5 bg-slate-900 text-white flex flex-col justify-center relative overflow-hidden border-t-4 md:border-t-0 md:border-l-4 border-brand-500">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-500/30 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 space-y-8">
                        <div>
                            <span className="block text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Kosten pro Jahr</span>
                            <strong className="block text-4xl sm:text-5xl font-extrabold text-brand-400">{currencyFormatter.format(costs.costYear)}</strong>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
                            <div>
                                <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Pro Monat</span>
                                <strong className="block text-xl font-bold text-white">{currencyFormatter.format(costs.costMonth)}</strong>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Verbrauch</span>
                                <strong className="block text-xl font-bold text-white">{numberFormatter.format(costs.kwhYear)} kWh</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* COLLAPSIBLE ASSUMPTIONS */}
            <details className="group mt-6 bg-white rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
                <summary className="flex justify-between items-center font-semibold cursor-pointer p-4 text-slate-700 hover:text-brand-600 transition-colors">
                    <span className="flex items-center gap-3">
                        <div className="bg-brand-50 p-2 rounded-lg text-brand-500 group-hover:bg-brand-100 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        Parameter & Annahmen
                    </span>
                    <span className="transition-transform group-open:-rotate-180 text-brand-500 bg-brand-50 rounded-full p-1">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </span>
                </summary>
                <div className="overflow-x-auto border-t border-slate-100 rounded-b-xl">
                    <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap sm:whitespace-normal">
                        <thead className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Parameter</th>
                                <th className="px-6 py-4">Standardwert</th>
                                <th className="px-6 py-4">Annahme / Quelle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">Leistung</td>
                                <td className="px-6 py-4"><span className="bg-brand-50 text-brand-600 font-bold px-2 py-1 rounded-md">{defaultWattage} W</span></td>
                                <td className="px-6 py-4">Durchschnittswert für handelsübliche Modelle ({deviceName})</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">Nutzung/Tag</td>
                                <td className="px-6 py-4"><span className="bg-brand-50 text-brand-600 font-bold px-2 py-1 rounded-md">{defaultHours} h</span></td>
                                <td className="px-6 py-4">Durchschnittliche Nutzungsdauer</td>
                            </tr>
                            <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">Strompreis</td>
                                <td className="px-6 py-4"><span className="bg-brand-50 text-brand-600 font-bold px-2 py-1 rounded-md">{defaultPrice} ct/kWh</span></td>
                                <td className="px-6 py-4">Aktueller Durchschnittswert (Stand {priceUpdateDate})</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </details>
        </section>
    );
}
