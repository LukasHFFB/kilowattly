'use client';

export default function FaqWidget({ question, answer }: { question: string, answer: string }) {
    return (
        <details className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
            <summary className="flex justify-between items-center font-semibold cursor-pointer p-6 text-slate-800 hover:text-brand-600 transition-colors">
                {question}
                <span className="ml-6 flex-shrink-0 text-brand-500 bg-brand-50 p-1 rounded-full group-open:rotate-180 transition-transform">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </span>
            </summary>
            <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-50 bg-slate-50/30 pt-4">
                {answer}
            </div>
        </details>
    );
}
