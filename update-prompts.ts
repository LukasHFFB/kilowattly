import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LOGIC_PROMPT = 'You are an expert energy consultant. For the given search keyword, extract the canonical device name (in German), its default wattage (in Watts), average daily usage in hours, and a broad category (e.g. "Heizen", "Haushalt", "Küche", "Unterhaltung"). Understand the context of the device to give realistic power consumption metrics (e.g. a Gaming PC uses more than a standard office laptop, a plasma TV more than LED). Return ONLY a valid JSON object matching exactly this structure with no markdown wrapping: {"device_name": "string", "default_wattage": 100, "average_daily_usage_hours": 2.5, "category": "Haushalt"}';

const CONTENT_PROMPT = 'You are a professional SEO copywriter and energy saving expert. Write a comprehensive, highly readable SEO text in German about the power consumption and electricity costs of a "{{deviceName}}" (based on keyword: "{{keyword}}"). The `seo_content` must focus specifically on \'Stromverbrauch\' (power consumption), \'Stromkosten\' (electricity costs), calculate detailed real-world examples, and give practical tips for saving energy. It should be 600-1200 words long, formatted as valid HTML using well-structured heading tags (<h2>, <h3>), paragraphs (<p>), and lists (<ul><li>). Do NOT include an <h1> or <body> tags. Make the text engaging, informative, and perfectly formatted for a modern blog post. The `faqs` must be exactly 4-6 frequently asked questions and detailed answers regarding the energy consumption of this specific device. Return ONLY a valid JSON object matching exactly this structure with NO markdown wrappers or backticks: {"seo_content": "<h2>...</h2><p>...</p>", "faqs": [{"question": "...", "answer": "..."}]}';

async function main() {
    console.log('Seeding optimized prompts to database...');

    await prisma.systemPrompt.upsert({
        where: { id: 'LOGIC' },
        update: { template: LOGIC_PROMPT },
        create: { id: 'LOGIC', template: LOGIC_PROMPT }
    });
    console.log('✅ Logic prompt updated');

    await prisma.systemPrompt.upsert({
        where: { id: 'CONTENT' },
        update: { template: CONTENT_PROMPT },
        create: { id: 'CONTENT', template: CONTENT_PROMPT }
    });
    console.log('✅ SEO Content prompt updated');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
