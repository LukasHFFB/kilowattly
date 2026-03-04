'use client';

import { useState, useEffect } from 'react';

export default function PromptSettings() {
    const [logicPrompt, setLogicPrompt] = useState<string>('');
    const [contentPrompt, setContentPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<string>('');

    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        try {
            const res = await fetch('/api/admin/prompt');
            const data = await res.json();
            setLogicPrompt(data.LOGIC);
            setContentPrompt(data.CONTENT);
        } catch (e) {
            console.error('Failed to load prompts', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (id: 'LOGIC' | 'CONTENT', template: string) => {
        setSaveStatus(`Speichere ${id}...`);
        try {
            const res = await fetch('/api/admin/prompt', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, template }),
            });

            if (res.ok) {
                setSaveStatus(`${id} gespeichert!`);
                setTimeout(() => setSaveStatus(''), 2000);
            } else {
                setSaveStatus(`Fehler beim Speichern von ${id}`);
            }
        } catch (e) {
            console.error('Failed to save prompt', e);
            setSaveStatus('Netzwerkfehler');
        }
    };

    const handleReset = async () => {
        if (!confirm('Prompts auf optimierte Standardwerte zurücksetzen? Deine aktuellen Anpassungen gehen verloren.')) return;
        setSaveStatus('Setze zurück...');
        try {
            const res = await fetch('/api/admin/prompt/reset', { method: 'DELETE' });
            if (res.ok) {
                setSaveStatus('Zurückgesetzt! Lade neue Defaults...');
                await fetchPrompts();
                setSaveStatus('Optimierte Prompts geladen!');
                setTimeout(() => setSaveStatus(''), 2000);
            } else {
                setSaveStatus('Reset fehlgeschlagen');
            }
        } catch (e) {
            console.error('Failed to reset prompts', e);
            setSaveStatus('Netzwerkfehler');
        }
    };

    if (isLoading) return <div className="animate-pulse bg-slate-100 h-64 rounded-2xl border border-slate-200"></div>;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">System Prompts anpassen</h2>
                <div className="flex items-center gap-3">
                    {saveStatus && (
                        <span className="text-sm font-medium text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                            {saveStatus}
                        </span>
                    )}
                    <button
                        onClick={handleReset}
                        className="text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors border border-amber-200"
                    >
                        Auf Defaults zurücksetzen
                    </button>
                </div>
            </div>

            <div className="space-y-8">
                {/* Logic Prompt */}
                <div>
                    <div className="mb-2">
                        <h3 className="text-sm font-bold text-slate-800">1. Logik & Daten Extraktion (NVIDIA Kimi)</h3>
                        <p className="text-xs text-slate-500">Dieser Prompt formatiert das Keyword in harte Fakten (Wattzahl, Name, Stunden). Gib das JSON-Format <strong className="text-red-500">niemals</strong> auf, da sonst die Datenbank abstürzt!</p>
                    </div>
                    <textarea
                        value={logicPrompt}
                        onChange={(e) => setLogicPrompt(e.target.value)}
                        className="w-full h-48 p-4 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-y"
                    />
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={() => handleSave('LOGIC', logicPrompt)}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                        >
                            Logik-Prompt Speichern
                        </button>
                    </div>
                </div>

                <div className="border-t border-slate-100"></div>

                {/* Content Prompt */}
                <div>
                    <div className="mb-2">
                        <h3 className="text-sm font-bold text-slate-800">2. SEO Text & FAQ Generierung (NVIDIA Kimi)</h3>
                        <p className="text-xs text-slate-500">Nutze <code className="bg-slate-100 px-1 rounded text-slate-700">{"{{keyword}}"}</code> und <code className="bg-slate-100 px-1 rounded text-slate-700">{"{{deviceName}}"}</code> als dynamische Platzhalter für das aktuelle Gerät. Halte auch hier die strenge JSON-Struktur ein!</p>
                    </div>
                    <textarea
                        value={contentPrompt}
                        onChange={(e) => setContentPrompt(e.target.value)}
                        className="w-full h-48 p-4 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-y"
                    />
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={() => handleSave('CONTENT', contentPrompt)}
                            className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                        >
                            SEO-Prompt Speichern
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
