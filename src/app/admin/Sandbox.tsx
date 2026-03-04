'use client';

import { useState } from 'react';

export default function Sandbox() {
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [result, setResult] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState('');

    const handleTest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setStatus('loading');
        setResult(null);
        setErrorMsg('');

        try {
            const res = await fetch('/api/admin/sandbox', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword: keyword.trim() })
            });
            const data = await res.json();

            if (res.ok) {
                setResult(data);
                setStatus('success');
            } else {
                setErrorMsg(data.error || 'Ein Fehler ist aufgetreten');
                setStatus('error');
            }
        } catch (e: any) {
            setErrorMsg(e.message || 'Ein Fehler ist aufgetreten');
            setStatus('error');
        }
    };

    return (
        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-800">
            <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                    <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    KI Sandbox (Test-Labor)
                </h2>
                <p className="text-slate-400 text-sm">Prüfe die NVIDIA KI-Ausgabe live, ohne Seiten auf der Plattform anzulegen.</p>

                <form onSubmit={handleTest} className="mt-6 flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Keyword, z.B. Heizlüfter..."
                        className="flex-grow bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder-slate-500"
                        disabled={status === 'loading'}
                    />
                    <button
                        type="submit"
                        disabled={status === 'loading' || !keyword.trim()}
                        className="bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap flex items-center justify-center min-w-[140px]"
                    >
                        {status === 'loading' ? (
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                <span>Lädt...</span>
                            </div>
                        ) : 'API Testen'}
                    </button>
                </form>
            </div>

            {(result || status === 'error') && (
                <div className="p-6 bg-black/50 overflow-x-auto max-h-[600px] custom-scrollbar">
                    {status === 'error' ? (
                        <div className="text-red-400 text-sm font-mono">{errorMsg}</div>
                    ) : (
                        <div className="text-sm">
                            <div className="flex flex-wrap items-center gap-4 mb-6 text-xs font-mono text-slate-500 border-b border-slate-800 pb-4">
                                <span className="bg-slate-800 px-2 py-1 rounded">Logik: {result.timing.logicMs}ms</span>
                                <span className="bg-slate-800 px-2 py-1 rounded">Content: {result.timing.contentMs}ms</span>
                                <span className="text-brand-400 font-semibold bg-brand-900/30 px-2 py-1 rounded">Total: {result.timing.totalMs}ms</span>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-slate-400 font-semibold mb-2">1. Extrahierte Logik (JSON)</h3>
                                    <pre className="text-green-400 font-mono text-xs overflow-x-auto">
                                        {JSON.stringify(result.logic, null, 2)}
                                    </pre>
                                </div>
                                <div className="border-t border-slate-800 pt-6">
                                    <h3 className="text-slate-400 font-semibold mb-2">2. Generierter Content (HTML + JSON FAQs)</h3>
                                    <pre className="text-blue-400 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                                        {JSON.stringify(result.content, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
