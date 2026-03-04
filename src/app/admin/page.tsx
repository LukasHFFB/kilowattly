'use client';

import { useState } from 'react';

export default function AdminPage() {
    const [keywords, setKeywords] = useState('');
    const [status, setStatus] = useState<{ message: string; type: 'idle' | 'loading' | 'success' | 'error' }>({ message: '', type: 'idle' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const lines = keywords.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length === 0) {
            setStatus({ message: 'Bitte gib mindestens ein Keyword ein.', type: 'error' });
            return;
        }

        setStatus({ message: `Sende ${lines.length} Keyword(s) an die Pipeline...`, type: 'loading' });

        let successCount = 0;
        let failCount = 0;

        for (const keyword of lines) {
            try {
                const res = await fetch('/api/ingest', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ keyword })
                });

                if (res.ok) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                failCount++;
            }
        }

        setStatus({
            message: `Fertig! ${successCount} erfolgreich in die Warteschlange gestellt${failCount > 0 ? `, ${failCount} fehlgeschlagen` : ''}.`,
            type: successCount > 0 ? 'success' : 'error'
        });

        if (successCount > 0) {
            setKeywords('');
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 p-8 sm:p-20">
            <div className="max-w-3xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Admin</h1>
                    <p className="text-slate-500 mt-2">Füge dem System neue Seiten über die automatisierte KI Pipeline hinzu.</p>
                </div>

                <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                        <div>
                            <label htmlFor="keywords" className="block text-sm font-semibold text-slate-700 mb-2">
                                Keywords (Eines pro Zeile)
                            </label>
                            <textarea
                                id="keywords"
                                name="keywords"
                                rows={10}
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none font-mono text-sm resize-y"
                                placeholder="Gartensauna&#10;Gaming PC&#10;Kühlschrank"
                                disabled={status.type === 'loading'}
                            />
                            <p className="text-sm text-slate-500 mt-2">
                                Jedes Keyword wird einzeln verarbeitet. Die KI sucht automatisch nach dem besten Gerät, generiert Logik, Mocks und SEO Texte.
                            </p>
                        </div>

                        {status.message && (
                            <div className={`p-4 rounded-xl ${status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                                    status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                                        status.type === 'loading' ? 'bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-3' : ''
                                }`}>
                                {status.type === 'loading' && (
                                    <svg className="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {status.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={status.type === 'loading'}
                            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-colors self-start"
                        >
                            {status.type === 'loading' ? 'Verarbeite...' : 'Pipeline Starten'}
                        </button>

                    </form>
                </div>
            </div>
        </main>
    );
}
