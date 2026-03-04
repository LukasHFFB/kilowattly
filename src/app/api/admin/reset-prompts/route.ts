import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await prisma.systemPrompt.deleteMany();

        return NextResponse.json({
            success: true,
            message: 'Alte Prompts aus der Datenbank gelöscht. Wenn du jetzt das Dashboard neu lädst, werden die neuen, optimierten Fallback-Texte angezeigt!'
        });
    } catch (error) {
        console.error('Error resetting prompts:', error);
        return NextResponse.json({ error: 'Failed to reset prompts' }, { status: 500 });
    }
}
