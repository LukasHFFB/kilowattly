'use client';

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

type Props = {
    deviceName: string;
    watt: number;
    hoursPerDay: number;
    priceCents: number;
};

export default function CostOverTimeChart({ deviceName, watt, hoursPerDay, priceCents }: Props) {
    const annualCost = (watt * hoursPerDay * 365) / 1000 * (priceCents / 100);

    const data = Array.from({ length: 5 }, (_, i) => {
        const year = i + 1;
        return {
            year: `Jahr ${year}`,
            kosten: Math.round(annualCost * year),
        };
    });

    const year = new Date().getFullYear();

    return (
        <figure className="w-full" role="img" aria-label={`Liniendiagramm: Kumulative Stromkosten ${deviceName} über 1 bis 5 Jahre, berechnet ${year}`}>
            <figcaption className="sr-only">
                Kostenentwicklung: {deviceName} verursacht über 5 Jahre kumulative Stromkosten von ca. {data[4].kosten} €.
            </figcaption>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                    data={data}
                    margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
                >
                    <defs>
                        <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                        dataKey="year"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#1e293b', fontSize: 13, fontWeight: 600 }}
                    />
                    <YAxis
                        tickFormatter={(v) => `${v} €`}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                        width={70}
                    />
                    <Tooltip
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any) => [`${value} €`, 'Kumulative Stromkosten']}
                        labelFormatter={(label) => `Nach ${label}`}
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
                    <Area
                        type="monotone"
                        dataKey="kosten"
                        stroke="#2563eb"
                        strokeWidth={3}
                        fill="url(#brandGradient)"
                        dot={{
                            r: 5,
                            fill: '#2563eb',
                            stroke: '#fff',
                            strokeWidth: 2,
                        }}
                        activeDot={{
                            r: 7,
                            fill: '#1d4ed8',
                            stroke: '#fff',
                            strokeWidth: 2,
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </figure>
    );
}
