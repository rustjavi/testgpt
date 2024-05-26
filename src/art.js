const os = require('os');
const { Client } = require('g4f');
const { Configuration, OpenAIApi } = require('openai');
const { syncToAsync } = require('asgiref');

const openaiClient = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_KEY
}));
const g4fClient = new Client();

async function draw(model, prompt) {
    let response;
    if (process.env.OPENAI_ENABLED === "False") {
        const asyncGenerate = syncToAsync(g4fClient.images.generate, { threadSensitive: true });
        response = await asyncGenerate({ model: model, prompt: prompt });
    } else {
        response = await openaiClient.createImage({
            model: "dall-e-3",
            prompt: prompt,
            size: "1792x1024",
            quality: "hd",
            n: 1
        });
    }
    const imageUrl = response.data[0].url;
    return imageUrl;
}

async function imitate(model, image) {
    const asyncGenerate = syncToAsync(g4fClient.images.createVariation, { threadSensitive: true });
    const response = await asyncGenerate({ model: model, image: image });
    const imageUrl = response.data[0].url;
    return imageUrl;
}


