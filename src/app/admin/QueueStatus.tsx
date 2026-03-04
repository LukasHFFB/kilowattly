'use client';

import { useEffect, useState } from 'react';

type QueueData = {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
};

export default function QueueStatus() {
    const [status, setStatus] = useState<QueueData | null>(null);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/admin/queue');
            if (res.ok) {
                const data = await res.json();
                setStatus(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    if (!status) return <div className="animate-pulse bg-slate-100 h-32 rounded-2xl border border-slate-200"></div>;

    const totalWaiting = status.waiting + status.delayed;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span>Pipeline Status</span>
                {status.active > 0 && (
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                    </span>
                )}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <div className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wider">Wartend</div>
                    <div className="text-3xl font-black text-slate-800">{totalWaiting}</div>
                </div>
                <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 flex flex-col items-center justify-center text-center">
                    <div className="text-brand-600 text-sm font-semibold mb-1 uppercase tracking-wider">Aktiv</div>
                    <div className="text-3xl font-black text-brand-700">{status.active}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col items-center justify-center text-center">
                    <div className="text-green-600 text-sm font-semibold mb-1 uppercase tracking-wider">Erfolgreich</div>
                    <div className="text-3xl font-black text-green-700">{status.completed}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col items-center justify-center text-center">
                    <div className="text-red-600 text-sm font-semibold mb-1 uppercase tracking-wider">Fehler</div>
                    <div className="text-3xl font-black text-red-700">{status.failed}</div>
                </div>
            </div>
        </div>
    );
}
