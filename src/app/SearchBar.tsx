'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type SearchResult = {
    slug: string;
    deviceName: string;
    default_wattage: number;
    keyword: string;
};

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (value: string) => {
        setQuery(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (value.trim().length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
                const data = await res.json();
                setResults(data.results || []);
                setIsOpen(true);
            } catch (e) {
                console.error('Search failed', e);
            } finally {
                setIsLoading(false);
            }
        }, 250);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (results.length > 0) {
            router.push(`/rechner/${results[0].slug}`);
            setIsOpen(false);
        }
    };

    const handleSelect = (slug: string) => {
        router.push(`/rechner/${slug}`);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div ref={wrapperRef} className="relative group max-w-2xl mx-auto">
            <form onSubmit={handleSubmit}>
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <svg className="w-6 h-6 text-slate-400 group-focus-within:text-brand-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    className="block w-full pl-14 pr-32 py-5 sm:py-6 bg-white border-2 border-slate-200 rounded-2xl text-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all"
                    placeholder="Z.B. Gartensauna, Gaming PC, Kühlschrank..."
                    autoComplete="off"
                />
                <button type="submit" className="absolute right-2.5 bottom-2.5 top-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl px-6 transition-colors shadow-sm">
                    Suchen
                </button>
            </form>

            {/* Dropdown Results */}
            {isOpen && (
                <div className="absolute z-50 top-full mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                    {isLoading ? (
                        <div className="p-4 text-center text-slate-400 text-sm">Suche...</div>
                    ) : results.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-sm">
                            Kein Rechner für &quot;{query}&quot; gefunden. Du kannst dieses Keyword im Admin-Dashboard hinzufügen!
                        </div>
                    ) : (
                        <ul>
                            {results.map((r) => (
                                <li key={r.slug}>
                                    <button
                                        onClick={() => handleSelect(r.slug)}
                                        className="w-full text-left px-5 py-3 hover:bg-brand-50 transition-colors flex items-center justify-between group"
                                    >
                                        <div>
                                            <span className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">{r.deviceName}</span>
                                            <span className="text-slate-400 text-sm ml-2">({r.default_wattage} W)</span>
                                        </div>
                                        <svg className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
