import { NextResponse } from 'next/server';
import { generateCalculatorLogic, generateSeoContent } from '@/lib/openai/generate';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { keyword } = await req.json();
        if (!keyword) {
            return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
        }

        const logicStartTime = Date.now();
        const logic = await generateCalculatorLogic(keyword);
        const logicEndTime = Date.now();

        const contentStartTime = Date.now();
        const content = await generateSeoContent(keyword, logic.device_name);
        const contentEndTime = Date.now();

        return NextResponse.json({
            logic,
            content,
            timing: {
                logicMs: logicEndTime - logicStartTime,
                contentMs: contentEndTime - contentStartTime,
                totalMs: contentEndTime - logicStartTime
            }
        });
    } catch (error: any) {
        console.error('Sandbox error:', error);
        return NextResponse.json({ error: error.message || 'Failed to execute sandbox' }, { status: 500 });
    }
}
