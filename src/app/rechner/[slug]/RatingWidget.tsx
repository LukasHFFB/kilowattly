'use client';
import { useState, useEffect } from 'react';

export default function RatingWidget({
    slug,
    initialAverage,
    initialCount
}: {
    slug: string;
    initialAverage: number;
    initialCount: number;
}) {
    const [hoveredStar, setHoveredStar] = useState<number>(0);
    const [hasVoted, setHasVoted] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Simple duplicate prevention using localStorage
    useEffect(() => {
        const votedStatus = localStorage.getItem(`kw_voted_${slug}`);
        if (votedStatus) setHasVoted(true);
    }, [slug]);

    const handleVote = async (score: number) => {
        if (hasVoted || isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/rechner/${slug}/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score })
            });

            if (!response.ok) {
                throw new Error('Vote failed');
            }

            // Immediately lock UI regardless of exact response to prevent spam
            localStorage.setItem(`kw_voted_${slug}`, 'true');
            setHasVoted(true);
        } catch (err: any) {
            console.error('Failed to submit rating', err);
            setError('Bewertung konnte nicht gesendet werden.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="mb-12 bg-slate-50 border border-slate-200 p-6 sm:p-8 rounded-2xl flex flex-col items-center justify-center text-center">

            {!hasVoted ? (
                <>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">War dieser Rechner hilfreich?</h3>
                    <p className="text-sm text-slate-500 mb-5">
                        Klicke auf die Sterne, um diesen Rechner zu bewerten. Bisherige Bewertung: {initialAverage}/5 ({initialCount} Stimmen).
                    </p>

                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                disabled={isSubmitting}
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(0)}
                                onClick={() => handleVote(star)}
                                className="focus:outline-none transition-transform hover:scale-110 active:scale-90"
                                aria-label={`Bewerte mit ${star} von 5 Sternen`}
                            >
                                <svg
                                    className={`w-10 h-10 transition-colors ${star <= (hoveredStar || Math.round(initialAverage))
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-slate-300 fill-transparent'
                                        }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                </svg>
                            </button>
                        ))}
                    </div>
                    {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
                </>
            ) : (
                <div className="flex flex-col items-center p-4">
                    <div className="bg-green-100 text-green-600 rounded-full p-4 mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Vielen Dank!</h3>
                    <p className="text-slate-500">Ihre Bewertung wurde erfolgreich gespeichert.</p>
                </div>
            )}

        </section>
    );
}
