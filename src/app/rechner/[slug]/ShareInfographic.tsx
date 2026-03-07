'use client';

import { useState } from 'react';

interface ShareInfographicProps {
    ogUrl: string;
    deviceName: string;
    pageUrl: string;
}

export default function ShareInfographic({ ogUrl, deviceName, pageUrl }: ShareInfographicProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(pageUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    return (
        <section className="mb-16 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                    Infografik teilen
                </h2>
                <p className="text-slate-600 max-w-lg mx-auto">
                    Hilf auch anderen, ihren Stromverbrauch besser einzuschätzen. Teile diese Übersicht zum {deviceName} mit deinen Freunden oder Kollegen.
                </p>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 mb-8 max-w-2xl mx-auto shadow-inner">
                <img
                    src={ogUrl}
                    alt={`Infografik: Stromkosten ${deviceName} im Jahresvergleich`}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                    width={1200}
                    height={630}
                />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="relative w-full sm:w-auto flex items-center bg-slate-100 rounded-xl px-4 py-3 text-slate-500 font-mono text-sm border border-slate-200 w-64 md:w-80 truncate">
                    {pageUrl}
                </div>
                <button
                    onClick={handleCopy}
                    className="w-full sm:w-auto relative inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white transition-all bg-brand-600 rounded-xl hover:bg-brand-500 focus:ring-4 focus:ring-brand-500/20 active:scale-[0.98]"
                >
                    {copied ? (
                        <>
                            <svg className="w-5 h-5 text-green-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            Kopiert!
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Link kopieren
                        </>
                    )}
                </button>
            </div>
        </section>
    );
}
