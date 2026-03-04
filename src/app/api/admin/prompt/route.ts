import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const prompts = await prisma.systemPrompt.findMany();

        // Provide defaults if not strictly set in the database yet
        const defaultLogic = 'You are an expert energy consultant. For the given search keyword, extract the canonical device name (in German), its default wattage (in Watts), average daily usage in hours, and a broad category (e.g. "Heizen", "Haushalt"). Return ONLY a valid JSON object matching exactly this structure with no markdown wrapping: {"device_name": "string", "default_wattage": 100, "average_daily_usage_hours": 2.5, "category": "Haushalt"}';
        const defaultContent = 'You are an expert SEO copywriter. Write detailed content and FAQs in German for calculating the power consumption of a "{{deviceName}}" (based on keyword: "{{keyword}}"). The seo_content must be a 500-1000 word HTML string using <h2>, <h3>, <p>, <ul>. The faqs must be 3-5 questions and answers. Return ONLY a valid JSON object matching exactly this structure with no markdown wrappers: {"seo_content": "<h2>Title</h2><p>text...</p>", "faqs": [{"question": "Q1", "answer": "A1"}]}';

        const logicModel = prompts.find((p: { id: string, template: string }) => p.id === 'LOGIC');
        const contentModel = prompts.find((p: { id: string, template: string }) => p.id === 'CONTENT');

        return NextResponse.json({
            LOGIC: logicModel?.template || defaultLogic,
            CONTENT: contentModel?.template || defaultContent,
        });
    } catch (error) {
        console.error('Error fetching prompts:', error);
        return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, template } = await req.json();

        if (!id || !template) {
            return NextResponse.json({ error: 'ID and template required' }, { status: 400 });
        }

        if (id !== 'LOGIC' && id !== 'CONTENT') {
            return NextResponse.json({ error: 'Invalid prompt ID' }, { status: 400 });
        }

        const updated = await prisma.systemPrompt.upsert({
            where: { id },
            update: { template },
            create: { id, template },
        });

        return NextResponse.json({ success: true, prompt: updated });
    } catch (error) {
        console.error('Error updating prompt:', error);
        return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
    }
}
