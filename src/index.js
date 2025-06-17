require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');

// Initialize Discord client
const client = new Client({
    checkUpdate: false,
    autoRedeemNitro: false,
    patchVoice: false,
    ws: {
        properties: {
            browser: 'Discord Android',
            os: 'Android',
            device: 'Android'
        }
    }
});

// Configuration
const config = {
    discordToken: process.env.DISCORD_TOKEN,
    channelId: process.env.DISCORD_CHANNEL_ID,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramChannelId: process.env.TELEGRAM_CHANNEL_ID,
    isDev: process.env.NODE_ENV === 'development',
    socksProxy: process.env.SOCKS_PROXY,
    botChannelName: 'discord-to-telegram'
};

// Validate configuration
function validateConfig() {
    const required = ['discordToken', 'channelId', 'telegramBotToken', 'telegramChannelId'];
    const missing = required.filter(key => !config[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }
}


// Create axios instance with SOCKS5 proxy if in dev mode
const axiosInstance = axios.create();
if (config.isDev && config.socksProxy) {
    const proxyAgent = new SocksProxyAgent(config.socksProxy);
    axiosInstance.defaults.httpsAgent = proxyAgent;
    console.log('Using SOCKS5 proxy for Telegram API calls:', config.socksProxy);
}

// Send message to Telegram
async function sendToTelegram(content) {
    try {
        const response = await axiosInstance.post(
            `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`,
            {
                chat_id: config.telegramChannelId,
                text: content,
                parse_mode: 'HTML'
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('Error sending message to Telegram:', error.response?.data || error.message);
        throw error;
    }
}

// Format Discord message
function formatMessage(message) {
    const author = message.author.username;
    const content = message.content.replace(/<#(\d+)>/g, 'channel'); // Replace Discord channel mentions
    const channelName = message.channel.name;
    const attachments = message.attachments.size > 0 
        ? `\nAttachments: ${Array.from(message.attachments.values()).map(a => a.url).join(', ')}`
        : '';
    
    return `<b>[Discord] #${channelName} | ${author}:</b>\n${content}${attachments}`;
}

// Event handlers
client.on('ready', async () => {
    console.log(`Logged in as ${client.user.username}`);
    console.log('Bot is ready to forward messages!');

    if (config.isDev) {
        console.log('Running in development mode');
        if (config.socksProxy) {
            console.log('SOCKS5 proxy enabled for Telegram API calls');
        }
    }
});

client.on('messageCreate', async (message) => {
    try {
        if (message.channel.id === config.channelId) {
            // Chỉ forward embed thông báo start game
            if (
                message.embeds.length > 0 &&
                message.embeds[0].title &&
                message.embeds[0].title.startsWith('Rumble Royale hosted by')
            ) {
                const embed = message.embeds[0];
                let formattedMessage = '';
                formattedMessage += embed.title ? `${embed.title}\n` : '';
                formattedMessage += embed.description ? `${embed.description}\n` : '';
                if (embed.fields && embed.fields.length > 0) {
                    embed.fields.forEach(field => {
                        formattedMessage += `${field.name}: ${field.value}\n`;
                    });
                }
                await sendToTelegram(formattedMessage.trim());
            }
            // Forward message thường (không phải embed)
            else if (message.embeds.length === 0) {
                const formattedMessage = formatMessage(message);
                await sendToTelegram(formattedMessage);
            }
            // Các embed khác sẽ bị bỏ qua
        }
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

// Start the bot
async function start() {
    try {
        validateConfig();
        await client.login(config.discordToken);
    } catch (error) {
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
}

start(); 