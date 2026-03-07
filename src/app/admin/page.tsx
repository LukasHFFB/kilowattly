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
                    <div className="mb-6 border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            Generierte Artikel
                            <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-sm font-semibold">{calculators.length}</span>
                        </h2>
                        <a
                            href="/api/admin/export-keywords"
                            download="kilowattly_keywords.txt"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Export Keywords (.txt)
                        </a>
                    </div>
                    <CalculatorList initialCalculators={calculators} />
                </div>
            </div>
        </div>
    );
}
