const os = require('os');
const { Client, Interaction, Choice } = require('discord.js');
const { RetryProvider, FreeGpt, ChatgptNext, AItianhuSpace, You, OpenaiChat, FreeChatgpt, Liaobots, Gemini, Bing } = require('g4f.Provider');
const { discordClient } = require('./src.aclient');
const { app_commands } = require('discord');

function run_discord_bot() {
    discordClient.on('ready', async () => {
        await discordClient.send_start_prompt();
        await discordClient.tree.sync();
        const loop = asyncio.get_event_loop();
        loop.create_task(discordClient.process_messages());
        logger.info(`${discordClient.user} is now running!`);
    });

    discordClient.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return;

        const { commandName, options } = interaction;

        if (commandName === 'chat') {
            const message = options.getString('message');
            if (discordClient.is_replying_all === 'True') {
                await interaction.deferReply({ ephemeral: false });
                await interaction.followUp('> **WARN: You already on replyAll mode. If you want to use the Slash Command, switch to normal mode by using `/replyall` again**');
                logger.warning('\x1b[31mYou already on replyAll mode, can\'t use slash command!\x1b[0m');
                return;
            }
            if (interaction.user === discordClient.user) {
                return;
            }
            const username = interaction.user.toString();
            discordClient.current_channel = interaction.channel;
            logger.info(`\x1b[31m${username}\x1b[0m : /chat [${message}] in (${discordClient.current_channel})`);

            await discordClient.enqueue_message(interaction, message);
        } else if (commandName === 'private') {
            await interaction.deferReply({ ephemeral: false });
            if (!discordClient.isPrivate) {
                discordClient.isPrivate = !discordClient.isPrivate;
                logger.warning('\x1b[31mSwitch to private mode\x1b[0m');
                await interaction.followUp('> **INFO: Next, the response will be sent via private reply. If you want to switch back to public mode, use `/public`**');
            } else {
                logger.info('You already on private mode!');
                await interaction.followUp('> **WARN: You already on private mode. If you want to switch to public mode, use `/public`**');
            }
        } else if (commandName === 'public') {
            await interaction.deferReply({ ephemeral: false });
            if (discordClient.isPrivate) {
                discordClient.isPrivate = !discordClient.isPrivate;
                await interaction.followUp('> **INFO: Next, the response will be sent to the channel directly. If you want to switch back to private mode, use `/private`**');
                logger.warning('\x1b[31mSwitch to public mode\x1b[0m');
            } else {
                await interaction.followUp('> **WARN: You already on public mode. If you want to switch to private mode, use `/private`**');
                logger.info('You already on public mode!');
            }
        } else if (commandName === 'replyall') {
            discordClient.replying_all_discord_channel_id = interaction.channelId.toString();
            await interaction.deferReply({ ephemeral: false });
            if (discordClient.is_replying_all === 'True') {
                discordClient.is_replying_all = 'False';
                await interaction.followUp('> **INFO: Next, the bot will response to the Slash Command. If you want to switch back to replyAll mode, use `/replyAll` again**');
                logger.warning('\x1b[31mSwitch to normal mode\x1b[0m');
            } else if (discordClient.is_replying_all === 'False') {
                discordClient.is_replying_all = 'True';
                await interaction.followUp('> **INFO: Next, the bot will disable Slash Command and responding to all message in this channel only. If you want to switch back to normal mode, use `/replyAll` again**');
                logger.warning('\x1b[31mSwitch to replyAll mode\x1b[0m');
            }
        } else if (commandName === 'chat-model') {
            await interaction.deferReply({ ephemeral: true });
            try {
                const model = options.getString('model');
                if (model === 'gemini') {
                    discordClient.reset_conversation_history();
                    discordClient.chatBot = new Client(new RetryProvider([Gemini, FreeChatgpt], false));
                    discordClient.chatModel = model;
                } else if (model === 'gpt-4') {
                    discordClient.reset_conversation_history();
                    discordClient.chatBot = new Client(new RetryProvider([Liaobots, You, OpenaiChat, Bing], false));
                    discordClient.chatModel = model;
                } else if (model === 'gpt-3.5-turbo') {
                    discordClient.reset_conversation_history();
                    discordClient.chatBot = new Client(new RetryProvider([FreeGpt, ChatgptNext, AItianhuSpace], false));
                    discordClient.chatModel = model;
                }

                await interaction.followUp(`> **INFO: Chat model switched to ${model}.**`);
                logger.info(`Switched chat model to ${model}`);
            } catch (e) {
                await interaction.followUp(`> **Error Switching Model: ${e}**`);
                logger.error(`Error switching chat model: ${e}`);
            }
        } else if (commandName === 'reset') {
            await interaction.deferReply({ ephemeral: false });
            discordClient.conversation_history = [];
            await interaction.followUp('> **INFO: I have forgotten everything.**');
            personas.current_persona = 'standard';
            logger.warning(`\x1b[31m${discordClient.chatModel} bot has been successfully reset\x1b[0m`);
        } else if (commandName === 'help') {
            await interaction.deferReply({ ephemeral: false });
            await interaction.followUp(`:star: **BASIC COMMANDS** \n
        - \`/chat [message]\` Chat with ChatGPT(gpt-4)
        - \`/draw [prompt][model]\` Generate an image with model you specific
        - \`/switchpersona [persona]\` Switch between optional ChatGPT jailbreaks
                \`dan\`: DAN 13.5 (Latest Working ChatGPT Jailbreak prompt)
                \`Smart mode\`: AIM (Always Intelligent and Machiavellian)
                \`Developer Mode\`: software developer who specializes in the AI's area
        - \`/private\` ChatGPT switch to private mode
        - \`/public\` ChatGPT switch to public mode
        - \`/replyall\` ChatGPT switch between replyAll mode and default mode
        - \`/reset\` Clear conversation history
        - \`/chat-model\` Switch different chat model
                \`gpt-4\`: GPT-4 model
                \`Gemini\`: Google gemini-pro model

For complete documentation, please visit:
https://github.com/Zero6992/chatGPT-discord-bot`);

            logger.info('\x1b[31mSomeone needs help!\x1b[0m');
        } else if (commandName === 'draw') {
            if (interaction.user === discordClient.user) {
                return;
            }

            const username = interaction.user.toString();
            const channel = interaction.channel.toString();
            logger.info(`\x1b[31m${username}\x1b[0m : /draw [${prompt}] in (${channel})`);

            await interaction.deferReply({ thinking: true, ephemeral: discordClient.isPrivate });
            try {
                const prompt = options.getString('prompt');
                const model = options.getString('model');
                const image_url = await art.draw(model, prompt);

                await interaction.followUp(image_url);
            } catch (e) {
                await interaction.followUp(`> Something Went Wrong, try again later.\n\nError Message:${e}`);
                logger.info(`\x1b[31m${username}\x1b[0m :${e}`);
            }
        } else if (commandName === 'switchpersona') {
            if (interaction.user === discordClient.user) {
                return;
            }

            await interaction.deferReply({ thinking: true });
            const username = interaction.user.toString();
            const channel = interaction.channel.toString();
            logger.info(`\x1b[31m${username}\x1b[0m : '/switchpersona [${persona}]' (${channel})`);

            const persona = options.getString('persona');

            if (persona === personas.current_persona) {
                await interaction.followUp(`> **WARN: Already set to \`${persona}\` persona**`);
            } else if (personas.PERSONAS.includes(persona)) {
                try {
                    await discordClient.switch_persona(persona);
                    personas.current_persona = persona;
                    await interaction.followUp(`> **INFO: Switched to \`${persona}\` persona**`);
                } catch (e) {
                    await interaction.followUp('> ERROR: Something went wrong, try again later! ');
                    logger.exception(`Error while switching persona: ${e}`);
                }
            } else {
                await interaction.followUp(`> **ERROR: No available persona: \`${persona}\` 😿**`);
                logger.info(`${username} requested an unavailable persona: \`${persona}\``);
            }
        }
    });

    discordClient.on('messageCreate', async (message) => {
        if (discordClient.is_replying_all === 'True') {
            if (message.author === discordClient.user) {
                return;
            }
            if (discordClient.replying_all_discord_channel_id) {
                if (message.channel.id === discordClient.replying_all_discord_channel_id) {
                    const username = message.author.toString();
                    const user_message = message.content.toString();
                    discordClient.current_channel = message.channel;
                    logger.info(`\x1b[31m${username}\x1b[0m : '${user_message}' (${discordClient.current_channel})`);

                    await discordClient.enqueue_message(message, user_message);
                }
            } else {
                logger.exception('replying_all_discord_channel_id not found, please use the command `/replyall` again.');
            }
        }
    });

    const TOKEN = process.env.DISCORD_BOT_TOKEN;

    discordClient.login(TOKEN);
}

run_discord_bot();


