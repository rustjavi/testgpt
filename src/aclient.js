import os from 'os';
import { Client as DiscordClient, Intents, ActivityType } from 'discord.js';
import { config as loadDotenv } from 'dotenv';
import { CommandTree } from 'discord.js';
import { syncToAsync } from 'asgiref';
import { createLogger } from 'src/log';
import { sendSplitMessage } from 'utils/message_utils';
import { Client as G4FClient, ChatCompletion } from 'g4f';
import { RetryProvider, OpenaiChat, Liaobots, Bing, You, FreeGpt, ChatgptNext, AItianhuSpace } from 'g4f/Provider';
import { AsyncOpenAI } from 'openai';

const logger = createLogger();
loadDotenv();

class DiscordClient extends DiscordClient {
    constructor() {
        const intents = new Intents();
        intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);
        super({ intents });

        this.tree = new CommandTree(this);
        this.chatBot = new G4FClient({
            provider: new RetryProvider([OpenaiChat, Liaobots, FreeGpt, ChatgptNext, AItianhuSpace, Bing, You], { shuffle: false }),
        });
        this.chatModel = process.env.MODEL;
        this.conversationHistory = [];
        this.currentChannel = null;
        this.activity = { type: ActivityType.LISTENING, name: "/chat | /help" };
        this.isPrivate = false;
        this.isReplyingAll = process.env.REPLYING_ALL;
        this.replyingAllDiscordChannelId = process.env.REPLYING_ALL_DISCORD_CHANNEL_ID;
        this.openaiClient = new AsyncOpenAI({ apiKey: process.env.OPENAI_KEY });

        const configDir = path.resolve(__dirname, '../../');
        const promptName = 'system_prompt.txt';
        const promptPath = path.join(configDir, promptName);
        this.startingPrompt = fs.readFileSync(promptPath, 'utf-8');

        this.messageQueue = new Queue();
    }

    async processMessages() {
        while (true) {
            if (this.currentChannel !== null) {
                while (!this.messageQueue.isEmpty()) {
                    await this.currentChannel.sendTyping();
                    const [message, userMessage] = await this.messageQueue.dequeue();
                    try {
                        await this.sendMessage(message, userMessage);
                    } catch (e) {
                        logger.error(`Error while processing message: ${e}`);
                    } finally {
                        this.messageQueue.taskDone();
                    }
                }
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    async enqueueMessage(message, userMessage) {
        if (this.isReplyingAll === "False") {
            await message.deferReply({ ephemeral: this.isPrivate });
        }
        await this.messageQueue.enqueue([message, userMessage]);
    }

    async sendMessage(message, userMessage) {
        const author = this.isReplyingAll === "False" ? message.user.id : message.author.id;
        try {
            const response = await this.handleResponse(userMessage);
            const responseContent = `> **${userMessage}** - <@${author}> \n\n${response}`;
            await sendSplitMessage(this, responseContent, message);
        } catch (e) {
            logger.error(`Error while sending: ${e}`);
        }
    }

    async sendStartPrompt() {
        const discordChannelId = process.env.DISCORD_CHANNEL_ID;
        try {
            if (this.startingPrompt && discordChannelId) {
                const channel = await this.channels.fetch(discordChannelId);
                logger.info(`Send system prompt with size ${this.startingPrompt.length}`);

                const response = await this.handleResponse(this.startingPrompt);
                await channel.send(response);

                logger.info(`System prompt response: ${response}`);
            } else {
                logger.info("No starting prompt given or no Discord channel selected. Skipping sending system prompt.");
            }
        } catch (e) {
            logger.error(`Error while sending system prompt: ${e}`);
        }
    }

    async handleResponse(userMessage) {
        this.conversationHistory.push({ role: 'user', content: userMessage });
        if (this.conversationHistory.length > 26) {
            this.conversationHistory.splice(4, 2);
        }
        let response;
        if (process.env.OPENAI_ENABLED === "False") {
            const asyncCreate = syncToAsync(this.chatBot.chat.completions.create, { threadSensitive: true });
            response = await asyncCreate({ model: this.chatModel, messages: this.conversationHistory });
        } else {
            response = await this.openaiClient.chat.completions.create({
                model: this.chatModel,
                messages: this.conversationHistory
            });
        }

        const botResponse = response.choices[0].message.content;
        this.conversationHistory.push({ role: 'assistant', content: botResponse });

        return botResponse;
    }

    resetConversationHistory() {
        this.conversationHistory = [];
        personas.currentPersona = "standard";
    }

    async switchPersona(persona) {
        this.resetConversationHistory();
        await this.handleResponse(personas.PERSONAS.get(persona));
        await this.sendStartPrompt();
    }
}

const discordClient = new DiscordClient();

