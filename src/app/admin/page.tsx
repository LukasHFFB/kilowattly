import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'System Admin | kilowattly',
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
        <main className="min-h-screen bg-slate-50 p-8 sm:p-20">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Admin</h1>
                    <p className="text-slate-500 mt-2">Füge dem System neue Seiten über die automatisierte KI Pipeline hinzu oder verwalte bestehende Rechner.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Form */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 h-fit">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Neuen Rechner generieren</h2>
                        <AdminClient />
                    </div>

                    {/* Right Column: Existing Calculators */}
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
                            Bereits erstellte Artikel ({calculators.length})
                        </h2>

                        <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {calculators.length === 0 ? (
                                <p className="text-slate-500 text-sm italic py-4">Noch keine Artikel vorhanden.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {calculators.map(calc => (
                                        <li key={calc.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <a href={`/rechner/${calc.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                                                        {calc.deviceName}
                                                    </a>
                                                    <p className="text-xs text-slate-500 mt-1">Keyword: {calc.keyword}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${calc.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {calc.status}
                                                    </span>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {new Date(calc.createdAt).toLocaleDateString('de-DE')}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
