const { Message } = require('discord.js');
const re = require('re');

async function sendSplitMessage(self, response, message, hasFollowedUp = false) {
    const charLimit = 1900;
    if (response.length > charLimit) {
        let isCodeBlock = false;
        const parts = response.split("");

        for (let i = 0; i < parts.length; i++) {
            if (isCodeBlock) {
                const codeBlockChunks = [];
                for (let j = 0; j < parts[i].length; j += charLimit) {
                    codeBlockChunks.push(parts[i].substring(j, j + charLimit));
                }
                for (const chunk of codeBlockChunks) {
                    if (self.isReplyingAll === "True" || hasFollowedUp) {
                        await message.channel.send(`\`\`\`${chunk}\`\`\``);
                    } else {
                        await message.followUp.send(`\`\`\`${chunk}\`\`\``);
                        hasFollowedUp = true;
                    }
                }
                isCodeBlock = false;
            } else {
                const nonCodeChunks = [];
                for (let j = 0; j < parts[i].length; j += charLimit) {
                    nonCodeChunks.push(parts[i].substring(j, j + charLimit));
                }
                for (const chunk of nonCodeChunks) {
                    if (self.isReplyingAll === "True" || hasFollowedUp) {
                        await message.channel.send(chunk);
                    } else {
                        await message.followUp.send(chunk);
                        hasFollowedUp = true;
                    }
                }
                isCodeBlock = true;
            }
        }
    } else {
        if (self.isReplyingAll === "True" || hasFollowedUp) {
            await message.channel.send(response);
        } else {
            await message.followUp.send(response);
            hasFollowedUp = true;
        }
    }

    return hasFollowedUp;
}

async function sendResponseWithImages(self, response, message) {
    const responseContent = response.content;
    const responseImages = response.images;

    const splitMessageText = responseContent.split(/\[Image of.*?\]/);

    for (let i = 0; i < splitMessageText.length; i++) {
        if (splitMessageText[i].trim()) {
            await sendSplitMessage(self, splitMessageText[i].trim(), message, true);
        }

        if (responseImages && i < responseImages.length) {
            await sendSplitMessage(self, responseImages[i].trim(), message, true);
        }
    }
}


