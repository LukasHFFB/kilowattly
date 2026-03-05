'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ArticleEditor from './ArticleEditor';

export default function CalculatorList({ initialCalculators }: { initialCalculators: any[] }) {
    const [calculators, setCalculators] = useState(initialCalculators);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingCalc, setEditingCalc] = useState<any | null>(null);
    const router = useRouter();

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Möchtest du den Rechner "${name}" wirklich unwiderruflich löschen?`)) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/calculator/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCalculators(prev => prev.filter(c => c.id !== id));
                router.refresh();
            } else {
                alert('Fehler beim Löschen des Artikels aus der Datenbank.');
            }
        } catch (e) {
            console.error(e);
            alert('Fehler beim Löschen.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <>
            <div className="max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                {calculators.length === 0 ? (
                    <p className="text-slate-500 text-sm italic py-4">Noch keine Artikel in der Datenbank vorhanden.</p>
                ) : (
                    <ul className="space-y-3">
                        {calculators.map(calc => (
                            <li key={calc.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                                <div className="flex justify-between items-center gap-4">
                                    <div>
                                        <a href={`/rechner/${calc.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                                            {calc.deviceName}
                                        </a>
                                        <p className="text-xs text-slate-500 mt-1">Keyword: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">{calc.keyword}</span></p>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <div className="flex flex-col items-end">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${calc.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {calc.status}
                                            </span>
                                            <p className="text-xs text-slate-400 mt-2">
                                                {new Date(calc.createdAt).toLocaleDateString('de-DE')}
                                            </p>
                                        </div>
                                        {/* Edit Button */}
                                        <button
                                            onClick={() => setEditingCalc(calc)}
                                            className="text-slate-300 hover:text-brand-600 transition-colors p-2 rounded-lg hover:bg-brand-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Artikel bearbeiten"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDelete(calc.id, calc.deviceName)}
                                            disabled={deletingId === calc.id}
                                            className="text-slate-300 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 disabled:opacity-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            title="Artikel löschen"
                                        >
                                            {deletingId === calc.id ? (
                                                <svg className="w-5 h-5 animate-spin text-red-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Article Editor Modal */}
            {editingCalc && (
                <ArticleEditor
                    calculator={editingCalc}
                    onClose={() => {
                        setEditingCalc(null);
                        router.refresh();
                    }}
                />
            )}
        </>
    );
}
