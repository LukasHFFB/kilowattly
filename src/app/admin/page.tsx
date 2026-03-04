import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import AdminClient from './AdminClient';
import QueueStatus from './QueueStatus';
import CalculatorList from './CalculatorList';
import Sandbox from './Sandbox';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Mission Control | kilowattly',
    robots: {
        index: false,
        follow: false,
    },
};

export default async function AdminPage() {
    const calculators = await prisma.calculator.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return (
        <main className="min-h-screen bg-slate-50 p-6 sm:p-12 font-sans pb-24">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mission Control</h1>
                    <p className="text-slate-500 mt-2">Programmatic Pipeline & Content Management.</p>
                </div>

                <QueueStatus />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Form & Sandbox */}
                    <div className="space-y-8">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Bulk Ingestion Pipeline</h2>
                            <AdminClient />
                        </div>
                        <Sandbox />
                    </div>

                    {/* Right Column: Existing Calculators */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 h-fit">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4 flex justify-between items-center">
                            <span>Generierte Artikel</span>
                            <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-sm font-semibold">{calculators.length}</span>
                        </h2>
                        <CalculatorList initialCalculators={calculators} />
                    </div>
                </div>

            </div>
        </main>
    );
}
