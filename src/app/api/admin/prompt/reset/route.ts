import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE() {
    try {
        await prisma.systemPrompt.deleteMany();
        return NextResponse.json({ success: true, message: 'Prompts auf Standardwerte zurückgesetzt' });
    } catch (error) {
        console.error('Error resetting prompts:', error);
        return NextResponse.json({ error: 'Reset fehlgeschlagen' }, { status: 500 });
    }
}
