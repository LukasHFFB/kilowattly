'use client';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';

type ComparisonDevice = {
    name: string;
    annualCost: number;
};

type Props = {
    deviceName: string;
    annualCost: number;
    comparisons: ComparisonDevice[];
};

export default function CostComparisonChart({ deviceName, annualCost, comparisons }: Props) {
    const data = [
        { name: deviceName, cost: annualCost, isCurrent: true },
        ...comparisons.map((d) => ({
            name: d.name,
            cost: d.annualCost,
            isCurrent: false,
        })),
    ].sort((a, b) => b.cost - a.cost);

    const year = new Date().getFullYear();

    return (
        <figure className="w-full" role="img" aria-label={`Balkendiagramm: Jährliche Stromkosten ${deviceName} im Vergleich zu ${comparisons.map(c => c.name).join(', ')}, ${year}`}>
            <figcaption className="sr-only">
                Stromkosten-Vergleich: {deviceName} verbraucht jährlich ca. {annualCost} € im Vergleich zu gängigen Haushaltsgeräten.
            </figcaption>
            <ResponsiveContainer width="100%" height={data.length * 56 + 40}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 8, right: 60, bottom: 8, left: 0 }}
                    barCategoryGap="20%"
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis
                        type="number"
                        tickFormatter={(v) => `${v} €`}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={180}
                        axisLine={false}
                        tickLine={false}
                        tick={({ x, y, payload }: any) => {
                            const name: string = payload.value;
                            // Split long names into two lines
                            if (name.length > 16) {
                                const mid = name.lastIndexOf(' ', 16);
                                const splitAt = mid > 0 ? mid : 16;
                                const line1 = name.slice(0, splitAt);
                                const line2 = name.slice(splitAt).trimStart();
                                return (
                                    <text x={x} y={y} textAnchor="end" fill="#1e293b" fontSize={13} fontWeight={600}>
                                        <tspan x={x} dy="-0.4em">{line1}</tspan>
                                        <tspan x={x} dy="1.2em">{line2}</tspan>
                                    </text>
                                );
                            }
                            return (
                                <text x={x} y={y} textAnchor="end" fill="#1e293b" fontSize={13} fontWeight={600} dy="0.35em">
                                    {name}
                                </text>
                            );
                        }}
                    />
                    <Tooltip
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any) => [`${value} € / Jahr`, 'Stromkosten']}
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: 600,
                            padding: '8px 14px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        }}
                    />
                    <Bar dataKey="cost" radius={[0, 8, 8, 0]} maxBarSize={36}>
                        {data.map((entry, idx) => (
                            <Cell
                                key={idx}
                                fill={entry.isCurrent ? '#2563eb' : '#e2e8f0'}
                                stroke={entry.isCurrent ? '#1d4ed8' : '#cbd5e1'}
                                strokeWidth={1}
                            />
                        ))}
                        <LabelList
                            dataKey="cost"
                            position="right"
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(v: any) => `${v} €`}
                            style={{ fill: '#334155', fontSize: 12, fontWeight: 700 }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </figure>
    );
}
