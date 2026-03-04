import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

const LogicSchema = z.object({
    device_name: z.string(),
    default_wattage: z.number(),
    average_daily_usage_hours: z.number(),
    category: z.string(),
});

export async function generateCalculatorLogic(keyword: string) {
    // Mock response if OPENAI_API_KEY is not defined dummy_key meaning user has not provided key yet.
    if (process.env.OPENAI_API_KEY === 'dummy_key' || !process.env.OPENAI_API_KEY) {
        console.log('WARN: Using mock logic data because OPENAI_API_KEY is missing');
        return {
            device_name: keyword,
            default_wattage: 1500,
            average_daily_usage_hours: 2.5,
            category: 'Generische Geräte'
        };
    }

    // @ts-ignore
    const response = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content:
                    'You are an expert energy consultant. For the given search keyword, extract the canonical device name (in German), its default wattage (in Watts), average daily usage in hours, and a broad category (e.g. "Heizen", "Haushalt").',
            },
            {
                role: 'user',
                content: keyword,
            },
        ],
        response_format: zodResponseFormat(LogicSchema, 'calculator_logic'),
    });

    return response.choices[0].message.parsed;
}

const ContentSchema = z.object({
    seo_content: z.string().describe("A 500-1000 word HTML structured article optimized for long-tail search intent related to the keyword's power consumption. Use <h2>, <h3>, <p>, <ul> tags. Text must be in German."),
    faqs: z.array(
        z.object({
            question: z.string(),
            answer: z.string(),
        })
    ).describe('A list of 3 to 5 frequently asked questions and their answers related to the power consumption of this device. Text must be in German.'),
});

export async function generateSeoContent(keyword: string, deviceName: string) {
    if (process.env.OPENAI_API_KEY === 'dummy_key' || !process.env.OPENAI_API_KEY) {
        console.log('WARN: Using mock content data because OPENAI_API_KEY is missing');
        return {
            seo_content: `<h2>Verbrauch von ${deviceName}</h2><p>Dies ist ein generierter Beispieltext, da kein API Key hinterlegt wurde.</p>`,
            faqs: [
                { question: `Verbraucht ${deviceName} viel Strom?`, answer: "Das hängt von der Nutzung ab." }
            ]
        };
    }

    // @ts-ignore
    const response = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `You are an expert SEO copywriter. Write detailed content and FAQs in German for calculating the power consumption of a "${deviceName}" (based on keyword: "${keyword}"). The content will be injected into a landing page. Return the result strictly matching the requested schema.`,
            },
            {
                role: 'user',
                content: `Generate SEO content and FAQs for: ${keyword}`,
            },
        ],
        response_format: zodResponseFormat(ContentSchema, 'seo_content'),
    });

    return response.choices[0].message.parsed;
}
