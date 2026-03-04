import OpenAI from 'openai';
import { z } from 'zod';

// We fall back to the provided NVIDIA API key if no environment variable is found.
// Note: We use the NVIDIA integrate base URL for standard OpenAI SDK compatibility.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "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",
    baseURL: process.env.API_BASE_URL || "https://integrate.api.nvidia.com/v1",
});

const LogicSchema = z.object({
    device_name: z.string(),
    default_wattage: z.number(),
    average_daily_usage_hours: z.number(),
    category: z.string(),
});

export async function generateCalculatorLogic(keyword: string) {
    console.log(`Requesting logic for ${keyword} using NVIDIA API/Kimi...`);
    const response = await openai.chat.completions.create({
        model: 'meta/llama-3.1-70b-instruct',
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: 'You are an expert energy consultant. For the given search keyword, extract the canonical device name (in German), its default wattage (in Watts), average daily usage in hours, and a broad category (e.g. "Heizen", "Haushalt"). Return ONLY a valid JSON object matching exactly this structure with no markdown wrapping: {"device_name": "string", "default_wattage": 100, "average_daily_usage_hours": 2.5, "category": "Haushalt"}'
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
    const response = await openai.chat.completions.create({
        model: 'meta/llama-3.1-70b-instruct',
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: `You are an expert SEO copywriter. Write detailed content and FAQs in German for calculating the power consumption of a "${deviceName}" (based on keyword: "${keyword}"). The seo_content must be a 500-1000 word HTML string using <h2>, <h3>, <p>, <ul>. The faqs must be 3-5 questions and answers. Return ONLY a valid JSON object matching exactly this structure with no markdown wrappers: {"seo_content": "<h2>Title</h2><p>text...</p>", "faqs": [{"question": "Q1", "answer": "A1"}]}`
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
