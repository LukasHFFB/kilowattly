'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Calculator = {
    id: string;
    slug: string;
    keyword: string;
    deviceName: string;
    default_wattage: number;
    average_daily_usage_hours: number;
    seo_content: string;
    faqs: string;
    status: string;
};

export default function ArticleEditor({ calculator, onClose }: { calculator: Calculator; onClose: () => void }) {
    const [form, setForm] = useState({
        deviceName: calculator.deviceName,
        keyword: calculator.keyword,
        default_wattage: calculator.default_wattage,
        average_daily_usage_hours: calculator.average_daily_usage_hours,
        seo_content: calculator.seo_content,
        faqs: calculator.faqs,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const router = useRouter();

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('Speichere...');
        try {
            const res = await fetch(`/api/admin/calculator/${calculator.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                setSaveStatus('Gespeichert!');
                router.refresh();
                setTimeout(() => {
                    setSaveStatus('');
                    onClose();
                }, 1000);
            } else {
                setSaveStatus('Fehler beim Speichern');
            }
        } catch (e) {
            console.error(e);
            setSaveStatus('Netzwerkfehler');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl mx-4">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Artikel bearbeiten</h2>
                        <p className="text-sm text-slate-500 mt-1">Slug: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">/rechner/{calculator.slug}</code></p>
                    </div>
                    <div className="flex items-center gap-3">
                        {saveStatus && (
                            <span className="text-sm font-medium text-brand-600 bg-brand-50 px-3 py-1 rounded-full">{saveStatus}</span>
                        )}
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Row: Device Name + Keyword */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Gerätename</label>
                            <input
                                value={form.deviceName}
                                onChange={(e) => setForm({ ...form, deviceName: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Keyword</label>
                            <input
                                value={form.keyword}
                                onChange={(e) => setForm({ ...form, keyword: e.target.value })}
                                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50"
                            />
                        </div>
                    </div>

                    {/* Row: Wattage + Hours */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Standard-Watt</label>
                            <input
                                type="number"
                                value={form.default_wattage}
                                onChange={(e) => setForm({ ...form, default_wattage: Number(e.target.value) })}
                                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Durchschn. Nutzung (Std/Tag)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={form.average_daily_usage_hours}
                                onChange={(e) => setForm({ ...form, average_daily_usage_hours: Number(e.target.value) })}
                                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50"
                            />
                        </div>
                    </div>

                    {/* SEO Content (HTML) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">SEO-Content (HTML)</label>
                        <textarea
                            value={form.seo_content}
                            onChange={(e) => setForm({ ...form, seo_content: e.target.value })}
                            className="w-full h-64 px-4 py-3 text-sm font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50 resize-y"
                        />
                    </div>

                    {/* FAQs (JSON) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">FAQs (JSON)</label>
                        <textarea
                            value={form.faqs}
                            onChange={(e) => setForm({ ...form, faqs: e.target.value })}
                            className="w-full h-40 px-4 py-3 text-sm font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50 resize-y"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                    <a
                        href={`/rechner/${calculator.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                    >
                        Vorschau öffnen
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
                            Abbrechen
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                        >
                            {isSaving ? 'Speichere...' : 'Änderungen Speichern'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
