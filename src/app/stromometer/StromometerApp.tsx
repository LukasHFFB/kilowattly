"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Legend } from 'recharts';

type GlobalStats = {
    totalSubmissions: number;
    avgPersons: number;
    avgAreaSqm: number;
    avgYearlyKwh: number;
    avgYearlyEuro: number;
};

type FormData = {
    persons: number;
    areaSqm: number;
    yearlyKwh: number;
    yearlyEuro: number;
};

export default function StromometerApp({ initialStats }: { initialStats: GlobalStats }) {
    const [stats, setStats] = useState<GlobalStats>(initialStats);
    const [step, setStep] = useState<1 | 2>(1);

    // Form State
    const [formData, setFormData] = useState<FormData>({
        persons: 2,
        areaSqm: 80,
        yearlyKwh: 2500,
        yearlyEuro: 850
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    // Hydrate form from URL on load if a user is visiting a shared link
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const p = query.get('p');
        const a = query.get('a');
        const k = query.get('k');
        const e = query.get('e');

        if (p && a && k && e) {
            setFormData({
                persons: parseInt(p),
                areaSqm: parseInt(a),
                yearlyKwh: parseInt(k),
                yearlyEuro: parseInt(e)
            });
            // Immediately jump to results for shared links so they don't have to re-submit
            setStep(2);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await fetch('/api/stromometer/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            // Re-fetch the newly skewed stats (optimistic updates could be done too)
            const statsRes = await fetch('/api/stromometer/stats');
            const newStats = await statsRes.json();
            setStats(newStats);
            setStep(2);

            // Clean URL and add query params to make it shareable
            const params = new URLSearchParams({
                p: formData.persons.toString(),
                a: formData.areaSqm.toString(),
                k: formData.yearlyKwh.toString(),
                e: formData.yearlyEuro.toString(),
            });
            window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
        } catch (error) {
            alert('Es gab einen Fehler bei der Übermittlung. Bitte prüfen Sie Ihre Eingaben.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Derived comparisons for charts
    const userKwhPerPerson = formData.yearlyKwh / formData.persons;
    const avgKwhPerPerson = stats.avgYearlyKwh / stats.avgPersons;

    const userEuroPerSqm = formData.yearlyEuro / formData.areaSqm;
    const avgEuroPerSqm = stats.avgYearlyEuro / stats.avgAreaSqm;

    const kwhChartData = [
        { name: "Dein Haushalt", value: Math.round(userKwhPerPerson), fill: "#3b82f6" },
        { name: "DE Durchschnitt", value: Math.round(avgKwhPerPerson), fill: "#94a3b8" }
    ];

    const costChartData = [
        { name: "Dein Haushalt", value: parseFloat(userEuroPerSqm.toFixed(2)), fill: "#f59e0b" },
        { name: "DE Durchschnitt", value: parseFloat(avgEuroPerSqm.toFixed(2)), fill: "#94a3b8" }
    ];

    if (step === 2) {
        const isAboveAverageEnergy = userKwhPerPerson > avgKwhPerPerson;
        const diffPerc = Math.abs(1 - (userKwhPerPerson / avgKwhPerPerson)) * 100;

        return (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Dein Strom-Rating ist da!</h2>
                        <p className="text-slate-500 mt-1">Basierend auf <strong>{stats.totalSubmissions.toLocaleString('de-DE')}</strong> Teilnehmern.</p>
                    </div>
                    <button onClick={() => setStep(1)} className="text-sm font-semibold text-brand-600 bg-brand-50 px-4 py-2 rounded-full hover:bg-brand-100 transition-colors">
                        Werte neu berechnen
                    </button>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center mb-10">
                    <div className={`inline-flex items-center justify-center p-4 rounded-full mb-4 ${isAboveAverageEnergy ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {isAboveAverageEnergy ? (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        ) : (
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        Du verbrauchst <span className={isAboveAverageEnergy ? "text-amber-600" : "text-emerald-600"}>{Math.round(diffPerc)}% {isAboveAverageEnergy ? "mehr" : "weniger"}</span> Strom pro Kopf als der Durchschnitt!
                    </h3>
                    <p className="text-slate-600">Dein Pro-Kopf Verbrauch liegt bei {Math.round(userKwhPerPerson)} kWh (Durchschnitt: {Math.round(avgKwhPerPerson)} kWh).</p>
                </div>

                {/* Dashboard Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                    {/* kWh per Person Chart */}
                    <div className="flex flex-col">
                        <h4 className="font-semibold text-slate-800 mb-6 text-center">Stromverbrauch pro Kopf (kWh)</h4>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={kwhChartData} margin={{ top: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} />
                                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        <LabelList dataKey="value" position="top" fill="#64748b" fontSize={13} fontWeight={600} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Cost per Sqm Chart */}
                    <div className="flex flex-col">
                        <h4 className="font-semibold text-slate-800 mb-6 text-center">Stromkosten pro Quadratmeter (€)</h4>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={costChartData} margin={{ top: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} />
                                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        <LabelList dataKey="value" position="top" fill="#64748b" fontSize={13} fontWeight={600} formatter={(val: any) => `€${val}`} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-8 text-center bg-brand-50/50 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 px-6 sm:px-10 pb-8 sm:pb-10 rounded-b-3xl">
                    <h4 className="font-bold text-slate-900 mb-2">Zeig deinen Freunden, wer sparsamer ist!</h4>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">Teile diesen Link. Dein Ergebnis wird mitverschickt (100% anonym). Deine Freunde können ihren eigenen Vergleich erstellen.</p>
                    <button
                        onClick={handleShare}
                        className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-semibold transition-all shadow-sm ${copied ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'}`}
                    >
                        {copied ? (
                            <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg> Link kopiert!</>
                        ) : (
                            <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg> Link kopieren & vergleichen</>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 w-full">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Ihre Haushaltsdaten</h2>
                <p className="text-slate-500">Diese Daten werden komplett anonym in unsere Studie aufgenommen.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Wie viele Personen leben im Haushalt?</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="1" max="15" required
                                value={formData.persons}
                                onChange={e => setFormData({ ...formData, persons: parseInt(e.target.value) || 0 })}
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow text-slate-900 font-medium"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Köpfe</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Wie groß ist die Wohnfläche?</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="10" max="1000" required
                                value={formData.areaSqm}
                                onChange={e => setFormData({ ...formData, areaSqm: parseInt(e.target.value) || 0 })}
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow text-slate-900 font-medium"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">m²</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Jahresstromverbrauch (siehe letzte Rechnung)</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="100" max="50000" required
                                value={formData.yearlyKwh}
                                onChange={e => setFormData({ ...formData, yearlyKwh: parseInt(e.target.value) || 0 })}
                                className="w-full pl-4 pr-14 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow text-slate-900 font-medium"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">kWh</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Jahresstromkosten (in Euro)</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="50" max="15000" required
                                value={formData.yearlyEuro}
                                onChange={e => setFormData({ ...formData, yearlyEuro: parseInt(e.target.value) || 0 })}
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow text-slate-900 font-medium"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Werte werden übertragen...' : 'Anonym eintragen & vergleichen'}
                    </button>
                    <p className="mt-4 text-center text-xs text-slate-500">
                        Bisher haben <strong className="text-slate-700">{stats.totalSubmissions.toLocaleString('de-DE')} Menschen</strong> an der Erhebung teilgenommen.
                    </p>
                </div>
            </form>
        </div>
    );
}
