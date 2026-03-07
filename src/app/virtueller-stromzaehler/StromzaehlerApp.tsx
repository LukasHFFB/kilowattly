'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

type CatalogItem = {
    id: string;
    deviceName: string;
    default_wattage: number;
    average_daily_usage_hours: number;
};

export type DeviceEntry = {
    uid: string; // Unique instance ID, in case they add the same device multiple times
    catalogId: string;
    name: string;
    watt: number;
    hours: number;
    count: number;
};

const CHART_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

export default function StromzaehlerApp({
    catalog,
    defaultPrice
}: {
    catalog: CatalogItem[],
    defaultPrice: number
}) {
    const [devices, setDevices] = useState<DeviceEntry[]>([]);
    const [priceCents, setPriceCents] = useState<number>(defaultPrice);

    // UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);
    const [isClient, setIsClient] = useState(false); // Hydration fix

    const searchRef = useRef<HTMLDivElement>(null);

    // Filter catalog based on search query
    const filteredCatalog = useMemo(() => {
        if (!searchQuery.trim()) return catalog.slice(0, 15); // Show top 15 initially
        const lowerQ = searchQuery.toLowerCase();
        return catalog.filter(c => c.deviceName.toLowerCase().includes(lowerQ)).slice(0, 15);
    }, [searchQuery, catalog]);

    // Handle initial URL state loading
    useEffect(() => {
        setIsClient(true);
        try {
            const params = new URLSearchParams(window.location.search);
            const stateParam = params.get('s');
            if (stateParam) {
                // simple base64 decode
                const decodedStr = atob(stateParam);
                const parsed = JSON.parse(decodedStr);
                if (parsed.p) setPriceCents(parsed.p);
                if (parsed.d && Array.isArray(parsed.d)) {
                    setDevices(parsed.d);
                }
            } else {
                // Default starter loadout to avoid an empty screen
                const starterTops = ['Kühlschrank', 'Fernseher', 'WLAN-Router'];
                const starterDevices: DeviceEntry[] = [];
                starterTops.forEach(name => {
                    const found = catalog.find(c => c.deviceName.includes(name));
                    if (found) {
                        starterDevices.push({
                            uid: Math.random().toString(36).substring(7),
                            catalogId: found.id,
                            name: found.deviceName,
                            watt: found.default_wattage,
                            hours: found.average_daily_usage_hours,
                            count: 1
                        });
                    }
                });
                setDevices(starterDevices);
            }
        } catch (e) {
            console.error('Failed to parse share URL', e);
        }
    }, [catalog]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchRef]);


    const addDevice = (item: CatalogItem) => {
        setDevices(prev => [...prev, {
            uid: Math.random().toString(36).substring(7),
            catalogId: item.id,
            name: item.deviceName,
            watt: item.default_wattage,
            hours: item.average_daily_usage_hours,
            count: 1
        }]);
        setSearchQuery('');
        setIsDropdownOpen(false);
    };

    const removeDevice = (uid: string) => {
        setDevices(prev => prev.filter(d => d.uid !== uid));
    };

    const updateDevice = (uid: string, field: keyof DeviceEntry, value: number) => {
        setDevices(prev => prev.map(d => {
            if (d.uid === uid) {
                return { ...d, [field]: value };
            }
            return d;
        }));
    };

    const shareConfig = () => {
        // Create compact representation for URL
        const stateObj = {
            p: priceCents,
            d: devices
        };
        const encoded = btoa(JSON.stringify(stateObj));
        const url = new URL(window.location.href);
        url.searchParams.set('s', encoded);
        navigator.clipboard.writeText(url.toString());
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 3000);
        // Update URL visibly without reloading
        window.history.replaceState({}, '', url.toString());
    };

    // --- Math & Analytics Calculations --- 

    const totals = useMemo(() => {
        let totalWatts = 0;
        let dailyKwh = 0;
        let dailyCents = 0;

        const breakdownData: { name: string, value: number, fill: string }[] = [];

        devices.forEach((d, idx) => {
            const dailyKwhDevice = (d.watt * d.hours * d.count) / 1000;
            const costCents = dailyKwhDevice * priceCents;

            totalWatts += (d.watt * d.count);
            dailyKwh += dailyKwhDevice;
            dailyCents += costCents;

            if (costCents > 0) {
                // If there are many items, grouping might be needed, but we keep it simple here
                breakdownData.push({
                    name: d.name + (d.count > 1 ? ` (x${d.count})` : ''),
                    value: Number(((costCents / 100) * 365).toFixed(2)), // Yearly cost in Euro
                    fill: CHART_COLORS[idx % CHART_COLORS.length]
                });
            }
        });

        // Sort breakdown by cost descending
        breakdownData.sort((a, b) => b.value - a.value);

        return {
            totalWatts,
            dailyEuro: dailyCents / 100,
            monthlyEuro: (dailyCents / 100) * 30.4,
            yearlyEuro: (dailyCents / 100) * 365,
            yearlyKwh: dailyKwh * 365,
            breakdownData
        };
    }, [devices, priceCents]);

    const barData = useMemo(() => {
        return totals.breakdownData.slice(0, 5).map(item => ({
            name: item.name,
            Kosten: item.value
        }));
    }, [totals]);


    // Avoid hydration mismatch for Recharts formatting
    if (!isClient) return <div className="min-h-[600px] flex justify-center items-center"><div className="animate-pulse flex items-center gap-3"><div className="w-6 h-6 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div><span>Lade Stromzähler...</span></div></div>;

    return (
        <div className="flex flex-col xl:flex-row gap-8 items-start w-full">

            {/* Left Column: Input Dashboard */}
            <div className="w-full xl:w-7/12 flex flex-col gap-6">

                {/* Master Settings Box */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">Ihr Setup</h2>
                        <p className="text-sm text-slate-500">Kombinieren Sie Ihre Geräte</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">Strompreis:</label>
                        <div className="relative flex-grow sm:flex-grow-0 sm:w-32">
                            <input
                                type="number"
                                step="any"
                                value={priceCents}
                                onChange={(e) => setPriceCents(Number(e.target.value) || 0)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-3 pr-10 text-slate-900 font-bold focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                            />
                            <div className="absolute inset-y-0 right-0 py-2 pr-3 flex items-center pointer-events-none text-slate-500 font-medium">
                                ct
                            </div>
                        </div>
                    </div>
                </div>

                {/* Combobox Add Device */}
                <div className="relative z-50" ref={searchRef}>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            className="w-full bg-white border border-brand-300 shadow-sm rounded-xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-lg transition-all"
                            placeholder="Weiteres Gerät hinzufügen (z.B. Fernseher)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsDropdownOpen(true)}
                        />
                    </div>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl max-h-72 overflow-y-auto z-50 py-2">
                            {filteredCatalog.length > 0 ? (
                                filteredCatalog.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => addDevice(item)}
                                        className="w-full text-left px-5 py-3 hover:bg-brand-50 flex items-center justify-between group transition-colors"
                                    >
                                        <span className="font-medium text-slate-700 group-hover:text-brand-700">{item.deviceName}</span>
                                        <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded-md group-hover:bg-brand-100 group-hover:text-brand-600">
                                            +{item.default_wattage}W
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-5 py-4 text-slate-500 text-center">Keine Geräte gefunden.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Device List array */}
                <div className="flex flex-col gap-3 z-0 relative">
                    {devices.length === 0 ? (
                        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center flex flex-col items-center">
                            <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            <p className="text-slate-500 font-medium text-lg">Keine Geräte ausgewählt</p>
                            <p className="text-slate-400 text-sm mt-1">Suchen Sie oben nach Geräten für Ihren virtuellen Haushalt.</p>
                        </div>
                    ) : (
                        devices.map((d) => (
                            <div key={d.uid} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between shadow-sm relative group hover:border-brand-300 transition-colors">
                                {/* Delete Button absolute top right for mobile, relative for desktop */}
                                <button
                                    onClick={() => removeDevice(d.uid)}
                                    className="absolute sm:relative top-3 sm:top-0 right-3 sm:right-0 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors order-last sm:order-none"
                                    title="Gerät entfernen"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>

                                <div className="flex-grow flex items-center pr-10 sm:pr-0 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 mr-4 shrink-0">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <h3 className="font-bold text-slate-900 truncate">{d.name}</h3>
                                </div>

                                <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0 auto-cols-auto grid-cols-2 grid sm:flex">
                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus-within:ring-2 ring-brand-500 transition-all col-span-1">
                                        <div className="flex flex-col text-xs text-slate-500 pl-2">
                                            <span className="font-semibold">Watt</span>
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            value={d.watt}
                                            onChange={(e) => updateDevice(d.uid, 'watt', Number(e.target.value) || 0)}
                                            className="w-16 bg-transparent text-slate-900 font-bold text-right outline-none pr-1"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus-within:ring-2 ring-brand-500 transition-all col-span-1">
                                        <div className="flex flex-col text-xs text-slate-500 pl-2">
                                            <span className="font-semibold">Std/Tag</span>
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={d.hours}
                                            onChange={(e) => updateDevice(d.uid, 'hours', Number(e.target.value) || 0)}
                                            className="w-14 bg-transparent text-slate-900 font-bold text-right outline-none pr-1"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus-within:ring-2 ring-brand-500 transition-all col-span-2 sm:col-span-1">
                                        <div className="flex flex-col text-xs text-slate-500 pl-2">
                                            <span className="font-semibold">Anzahl</span>
                                        </div>
                                        <div className="flex items-center shrink-0">
                                            <button onClick={() => updateDevice(d.uid, 'count', Math.max(1, d.count - 1))} className="w-8 h-8 rounded-md hover:bg-slate-200 flex justify-center items-center text-slate-600 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg></button>
                                            <span className="w-8 text-center font-bold text-slate-900">{d.count}</span>
                                            <button onClick={() => updateDevice(d.uid, 'count', d.count + 1)} className="w-8 h-8 rounded-md hover:bg-slate-200 flex justify-center items-center text-slate-600 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Column: Visualization Dashboard */}
            <div className="w-full xl:w-5/12 flex flex-col gap-6 sticky top-8">

                {/* Total Stats Banner */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-lg text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-slate-400 font-semibold mb-2 uppercase tracking-wider text-sm">Zählerstand Haushalt</h3>

                    <div className="flex items-end gap-3 mb-8">
                        <div className="text-5xl font-black tabular-nums tracking-tight">€{totals.yearlyEuro.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="text-xl text-slate-400 font-medium mb-1">/ Jahr</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                            <div className="text-slate-400 text-xs font-semibold mb-1">STROMVERBRAUCH</div>
                            <div className="text-xl font-bold">{totals.yearlyKwh.toLocaleString('de-DE', { maximumFractionDigits: 0 })} <span className="text-sm font-normal text-slate-400">kWh</span></div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                            <div className="text-slate-400 text-xs font-semibold mb-1">KOSTEN PRO MONAT</div>
                            <div className="text-xl font-bold">€{totals.monthlyEuro.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                    </div>
                </div>

                {/* Pie Chart: Cost Split */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                        Ihre größten Stromfresser
                    </h3>

                    {devices.length > 0 && totals.yearlyEuro > 0 ? (
                        <div className="h-64 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={totals.breakdownData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {totals.breakdownData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={((value: any) => [`€${Number(value).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/Jahr`, 'Kosten']) as any}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-slate-900">{devices.length}</span>
                                <span className="text-xs text-slate-500 font-semibold uppercase">Geräte</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            Fügen Sie Geräte hinzu, um das Diagramm zu füllen.
                        </div>
                    )}

                    {/* Small Legend */}
                    {devices.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                            {totals.breakdownData.slice(0, 5).map((d, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.fill }}></div>
                                    <span className="text-slate-600 truncate max-w-[100px]" title={d.name}>{d.name}</span>
                                    <span className="font-semibold text-slate-900 ml-1 shrink-0">
                                        {Math.round((d.value / totals.yearlyEuro) * 100)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bar Chart: Top Appliances */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        Top 5 Jahreskosten
                    </h3>
                    <div className="h-48 w-full -ml-4">
                        {devices.length > 0 && totals.yearlyEuro > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis
                                        type="number"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 13 }}
                                        tickFormatter={(value) => `€${value}`}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={100}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                                    />
                                    <RechartsTooltip
                                        formatter={((value: any) => [`€${Number(value).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Stromkosten/Jahr']) as any}
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="Kosten" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200 ml-4">
                                Fügen Sie Geräte hinzu.
                            </div>
                        )}
                    </div>
                </div>

                {/* Share Widget Widget */}
                <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                    <h3 className="font-bold text-brand-900 mb-2">Ergebnis speichern & teilen</h3>
                    <p className="text-brand-700 text-sm mb-4">Erzeugen Sie einen Link, um Ihren Haushalt mit anderen zu vergleichen oder für später zu speichern.</p>
                    <button
                        onClick={shareConfig}
                        className={`w-full py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${shareCopied ? 'bg-green-500 text-white shadow-green-500/20 shadow-lg' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-500/20 shadow-lg hover:shadow-brand-500/40 hover:-translate-y-0.5'
                            }`}
                    >
                        {shareCopied ? (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                Link kopiert!
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                Link zum Setup generieren
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
