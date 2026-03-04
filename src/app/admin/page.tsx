import { Metadata } from 'next';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import AdminClient from './AdminClient';
import QueueStatus from './QueueStatus';
import CalculatorList from './CalculatorList';
import Sandbox from './Sandbox';
import PromptSettings from './PromptSettings';

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
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mission Control</h1>
                    <p className="mt-2 text-sm text-slate-500">Kilowattly Programmatic SEO Pipeline & Warteschlange</p>
                </div>

                {/* Queue Status Widget */}
                <QueueStatus />

                {/* Top Row: AI Sandbox & Ingestion */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AdminClient />
                    <Sandbox />
                </div>

                {/* Settings & Prompts */}
                <PromptSettings />

                {/* Bottom Row: Deletion/Review List */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 h-fit">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4 flex justify-between items-center">
                        <span>Generierte Artikel</span>
                        <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-sm font-semibold">{calculators.length}</span>
                    </h2>
                    <CalculatorList initialCalculators={calculators} />
                </div>
            </div>
        </div>
    );
}
