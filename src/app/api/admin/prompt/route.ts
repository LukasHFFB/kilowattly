import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const prompts = await prisma.systemPrompt.findMany();

        // Provide defaults if not strictly set in the database yet
        const defaultLogic = 'You are an expert energy consultant. For the given search keyword, extract the canonical device name (in German), its default wattage (in Watts), average daily usage in hours, and a broad category (e.g. "Heizen", "Haushalt"). Understand context to give realistic power consumption metrics (e.g. a Gaming PC uses more than a laptop, a plasma TV more than LED). Return ONLY a valid JSON object matching exactly this structure with no markdown wrapping: {"device_name": "string", "default_wattage": 100, "average_daily_usage_hours": 2.5, "category": "Haushalt"}';
        const defaultContent = 'You are a professional SEO copywriter and energy saving expert. Write a comprehensive, highly readable SEO text in German about the power consumption and electricity costs of a "{{deviceName}}" (based on keyword: "{{keyword}}"). The `seo_content` must focus specifically on \'Stromverbrauch\' (power consumption), \'Stromkosten\' (electricity costs), calculate examples, and give practical tips for saving energy. It should be 600-1200 words long, formatted as valid HTML using well-structured heading tags (<h2>, <h3>), paragraphs (<p>), and lists (<ul><li>). Do NOT include an <h1> or <body> tags. Make the text engaging, informative, and perfectly formatted. The `faqs` must be exactly 4-6 frequently asked questions and detailed answers regarding the energy consumption of this device. Return ONLY a valid JSON object matching exactly this structure with NO markdown wrappers or backticks: {"seo_content": "<h2>...</h2><p>...</p>", "faqs": [{"question": "...", "answer": "..."}]}';

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
