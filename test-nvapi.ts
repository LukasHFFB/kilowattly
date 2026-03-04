import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: "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",
    baseURL: "https://integrate.api.nvidia.com/v1",
});

async function main() {
    try {
        console.log("Testing completion on moonshotai/kimi-k2.5 with max_tokens...");
        const response = await openai.chat.completions.create({
            model: 'moonshotai/kimi-k2.5',
            messages: [{ role: 'user', content: 'Say hello in 5 words' }],
            max_tokens: 100,
        });
        console.log("Response:", response.choices[0].message.content);
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

main();
