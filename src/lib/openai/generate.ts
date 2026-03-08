import OpenAI from 'openai';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// We fall back to the provided NVIDIA API key if no environment variable is found.
// Note: We use the NVIDIA integrate base URL for standard OpenAI SDK compatibility.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "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",
    baseURL: process.env.API_BASE_URL || "https://integrate.api.nvidia.com/v1",
});

const LogicSchema = z.object({
    default_wattage: z.number(),
    average_daily_usage_hours: z.number(),
    category: z.string(),
});

export async function generateCalculatorLogic(keyword: string) {
    console.log(`Requesting logic for ${keyword} using NVIDIA API/Kimi...`);

    // Fetch custom prompt or use default
    const customPrompt = await prisma.systemPrompt.findUnique({ where: { id: 'LOGIC' } });
    const systemInstruction = customPrompt?.template || 'You are an expert energy consultant. For the given search keyword, extract its default wattage (in Watts), average daily usage in hours, and a broad category (e.g. "Heizen", "Haushalt"). Understand context to give realistic power consumption metrics (e.g. a Gaming PC uses more than a laptop, a plasma TV more than LED). Return ONLY a valid JSON object matching exactly this structure with no markdown wrapping: {"default_wattage": 100, "average_daily_usage_hours": 2.5, "category": "Haushalt"}';

    const response = await openai.chat.completions.create({
        model: 'meta/llama-3.1-70b-instruct',
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: systemInstruction
            },
            {
                role: 'user',
                content: keyword,
            },
        ],
    });

    const body = response.choices[0].message.content || '{}';
    try {
        return LogicSchema.parse(JSON.parse(body));
    } catch (e) {
        console.error("Failed to parse LLM Response correctly:", body);
        throw new Error("Invalid format returned by LLM");
    }
}

const ContentSchema = z.object({
    seo_content: z.string(),
    faqs: z.array(
        z.object({
            question: z.string(),
            answer: z.string(),
        })
    )
});

export async function generateSeoContent(keyword: string, deviceName: string) {
    // Fetch custom prompt or use default
    const customPrompt = await prisma.systemPrompt.findUnique({ where: { id: 'CONTENT' } });
    let systemInstruction = customPrompt?.template || 'You are a professional SEO copywriter and energy saving expert. Write a comprehensive, highly readable SEO text in German about the power consumption and electricity costs of a "{{deviceName}}" (based on keyword: "{{keyword}}"). The `seo_content` must focus specifically on \'Stromverbrauch\' (power consumption), \'Stromkosten\' (electricity costs), calculate examples, and give practical tips for saving energy. It should be 600-1200 words long, formatted as valid HTML using well-structured heading tags (<h2>, <h3>), paragraphs (<p>), and lists (<ul><li>). Do NOT include an <h1> or <body> tags. Make the text engaging, informative, and perfectly formatted. The `faqs` must be exactly 4-6 frequently asked questions and detailed answers regarding the energy consumption of this device. Return ONLY a valid JSON object matching exactly this structure with NO markdown wrappers or backticks: {"seo_content": "<h2>...</h2><p>...</p>", "faqs": [{"question": "...", "answer": "..."}]}';

    // Replace dynamic {{variables}}
    systemInstruction = systemInstruction.replace(/\{\{deviceName\}\}/g, deviceName).replace(/\{\{keyword\}\}/g, keyword);

    const response = await openai.chat.completions.create({
        model: 'meta/llama-3.1-70b-instruct',
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: systemInstruction
            },
            {
                role: 'user',
                content: `Generate SEO content and FAQs for: ${keyword}`,
            },
        ],
    });

    const body = response.choices[0].message.content || '{}';
    try {
        return ContentSchema.parse(JSON.parse(body));
    } catch (e) {
        console.error("Failed to parse LLM Content Response:", body);
        throw new Error("Invalid content format from LLM");
    }
}
