import { ImageResponse } from 'next/og';
import prisma from '@/lib/prisma';

// 1200x630 is the standard OG image size

// We want the image to be 1200x630 (standard OG image size)
export const alt = 'Stromkosten im Vergleich';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

const WELL_KNOWN = ['Kühlschrank', 'Waschmaschine', 'Fernseher', 'Staubsauger', 'WLAN-Router', 'Geschirrspüler'];

const computeAnnualCost = (c: { default_wattage: number; average_daily_usage_hours: number; price_cents: number }) =>
    Math.round((c.default_wattage * c.average_daily_usage_hours * 365) / 1000 * (c.price_cents / 100));

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;

        const calculator = await prisma.calculator.findUnique({
            where: { slug, status: 'PUBLISHED' },
        });

        if (!calculator) {
            return new Response('Not found', { status: 404 });
        }

        // Fetch other top calculators to show on the bar chart
        const allOtherCalculators = await prisma.calculator.findMany({
            where: { status: 'PUBLISHED', slug: { not: slug } },
            select: { deviceName: true, default_wattage: true, average_daily_usage_hours: true, price_cents: true },
        });

        const currentAnnualCost = computeAnnualCost(calculator);

        const wellKnownMatches = allOtherCalculators.filter((c) =>
            WELL_KNOWN.some((name) => c.deviceName.toLowerCase().includes(name.toLowerCase()))
        );
        const otherCalcs = allOtherCalculators.filter((c) =>
            !WELL_KNOWN.some((name) => c.deviceName.toLowerCase().includes(name.toLowerCase()))
        );
        const comparisonPool = [...wellKnownMatches, ...otherCalcs];

        const comparisonDevices = comparisonPool.slice(0, 4).map((c) => ({
            name: c.deviceName,
            cost: computeAnnualCost(c),
            isCurrent: false,
        }));

        const data = [
            { name: calculator.deviceName, cost: currentAnnualCost, isCurrent: true },
            ...comparisonDevices,
        ].sort((a, b) => b.cost - a.cost);

        const maxCost = Math.max(...data.map((d) => d.cost));

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        backgroundColor: '#ffffff',
                        padding: '60px 80px',
                        fontFamily: '"Inter", sans-serif',
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                        <div style={{ display: 'flex', color: '#2563eb', fontWeight: 800, fontSize: 32, marginRight: 24 }}>
                            kilowattly.
                        </div>
                        <div
                            style={{
                                color: '#1e293b',
                                fontSize: 42,
                                fontWeight: 800,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Stromkosten <span style={{ color: '#2563eb', marginLeft: 12 }}>{calculator.deviceName}</span>
                        </div>
                    </div>

                    {/* Chart Container */}
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: 1, justifyContent: 'space-between', padding: '20px 0' }}>
                        {data.map((item, index) => {
                            // Calculate width percentage relative to max cost, ensure min width for visibility
                            const widthPercent = Math.max(10, (item.cost / maxCost) * 85);
                            return (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    {/* Y-Axis Label */}
                                    <div
                                        style={{
                                            width: '280px',
                                            fontSize: 24,
                                            fontWeight: item.isCurrent ? 700 : 500,
                                            color: item.isCurrent ? '#1e293b' : '#64748b',
                                            textAlign: 'right',
                                            paddingRight: '24px',
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                        }}
                                    >
                                        {item.name}
                                    </div>

                                    {/* Bar and Value */}
                                    <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
                                        <div
                                            style={{
                                                height: '48px',
                                                width: `${widthPercent}%`,
                                                backgroundColor: item.isCurrent ? '#2563eb' : '#e2e8f0',
                                                border: `2px solid ${item.isCurrent ? '#1d4ed8' : '#cbd5e1'}`,
                                                borderRight: 'none',
                                                borderTopLeftRadius: '0px',
                                                borderBottomLeftRadius: '0px',
                                                borderTopRightRadius: '12px',
                                                borderBottomRightRadius: '12px',
                                                display: 'flex',
                                            }}
                                        />
                                        <div
                                            style={{
                                                marginLeft: '20px',
                                                fontSize: 28,
                                                fontWeight: 800,
                                                color: item.isCurrent ? '#2563eb' : '#334155',
                                                display: 'flex',
                                            }}
                                        >
                                            {item.cost} €
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', marginTop: '40px', fontSize: 22, color: '#64748b', fontWeight: 500 }}>
                        Jährliche Stromkosten im Haushaltsvergleich • Quelle: kilowattly.de
                    </div>
                </div>
            ),
            {
                ...size,
                headers: {
                    'Cache-Control': 'public, max-age=604800, stale-while-revalidate=2592000',
                },
            }
        );
    } catch (e) {
        return new Response('Failed to generate image', { status: 500 });
    }
}
