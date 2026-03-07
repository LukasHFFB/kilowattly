'use client';

import { useState, useCallback } from 'react';
import CalculatorWidget from './CalculatorWidget';
import CostComparisonChart from './CostComparisonChart';
import CostOverTimeChart from './CostOverTimeChart';

type ComparisonDevice = {
    name: string;
    watt: number;
    hoursPerDay: number;
    priceCents: number;
};

type Props = {
    deviceName: string;
    defaultWattage: number;
    defaultHours: number;
    defaultPrice: number;
    comparisons: ComparisonDevice[];
};

function computeAnnualCost(watt: number, hours: number, priceCents: number) {
    return Math.round((watt * hours * 365) / 1000 * (priceCents / 100));
}

export default function CalculatorSection({ deviceName, defaultWattage, defaultHours, defaultPrice, comparisons }: Props) {
    const [liveValues, setLiveValues] = useState({
        watt: defaultWattage,
        hours: defaultHours,
        price: defaultPrice,
    });

    const handleValuesChange = useCallback((values: { watt: number; hours: number; price: number }) => {
        setLiveValues(values);
    }, []);

    const currentAnnualCost = computeAnnualCost(liveValues.watt, liveValues.hours, liveValues.price);

    // Recompute comparison costs using the user's current electricity price
    const comparisonData = comparisons.map((c) => ({
        name: c.name,
        annualCost: computeAnnualCost(c.watt, c.hoursPerDay, liveValues.price),
    }));

    return (
        <>
            <CalculatorWidget
                defaultWattage={defaultWattage}
                defaultHours={defaultHours}
                defaultPrice={defaultPrice}
                deviceName={deviceName}
                onValuesChange={handleValuesChange}
            />

            {/* Charts — stacked vertically */}
            <section className="mb-16 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    Stromkosten {deviceName} im Vergleich
                </h2>
                <p className="text-sm text-slate-500 mb-5">Jährliche Stromkosten im Vergleich zu gängigen Haushaltsgeräten</p>
                <CostComparisonChart
                    deviceName={deviceName}
                    annualCost={currentAnnualCost}
                    comparisons={comparisonData}
                />
            </section>

            <section className="mb-16 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    Stromkosten {deviceName} über 5 Jahre
                </h2>
                <p className="text-sm text-slate-500 mb-5">Kumulative Stromkosten bei gleichbleibender Nutzung</p>
                <CostOverTimeChart
                    deviceName={deviceName}
                    watt={liveValues.watt}
                    hoursPerDay={liveValues.hours}
                    priceCents={liveValues.price}
                />
            </section>
        </>
    );
}
