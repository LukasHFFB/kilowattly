import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: "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",
    baseURL: "https://integrate.api.nvidia.com/v1",
});

async function main() {
    try {
        const res = await openai.models.list();
        const models = res.data.map(m => m.id);
        const moonshotModels = models.filter(m => m.includes('moonshot') || m.includes('kimi'));
        console.log("Moonshot/Kimi models available:", moonshotModels);
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

main();
