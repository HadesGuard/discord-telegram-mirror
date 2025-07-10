require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');

// Multi-account configuration
const accounts = [];
const numAccounts = parseInt(process.env.NUM_ACCOUNTS) || 1;

// Quản lý pending reactions để tránh spam
const pendingReactions = new Map(); // messageId -> { timer, accountId }

// Cleanup old timers mỗi 10 phút
setInterval(() => {
    const now = Date.now();
    const maxAge = 6 * 60 * 1000; // 6 phút (1 phút buffer)
    let cleanedCount = 0;
    
    for (const [key, data] of pendingReactions.entries()) {
        if (now - data.startTime > maxAge) {
            clearTimeout(data.timer);
            pendingReactions.delete(key);
            cleanedCount++;
        }
    }
    
    if (cleanedCount > 0) {
        console.log(`🧹 Cleaned up ${cleanedCount} old timers. Active timers: ${pendingReactions.size}`);
    }
}, 10 * 60 * 1000);

// Log trạng thái mỗi phút
setInterval(() => {
    if (pendingReactions.size > 0) {
        console.log(`📊 Currently monitoring ${pendingReactions.size} messages for reactions`);
    }
}, 60 * 1000);

// Load account configurations
for (let i = 1; i <= numAccounts; i++) {
    const accountConfig = {
        id: i,
        token: process.env[`DISCORD_TOKEN_${i}`],
        channelId: process.env.DISCORD_CHANNEL_ID,
        proxy: process.env[`PROXY_${i}`] || process.env.PROXY, // Individual or shared proxy
        autoReact: {
            enabled: process.env.AUTO_REACT_ENABLED !== 'false',
            emoji: process.env[`AUTO_REACT_EMOJI_${i}`] || process.env.AUTO_REACT_EMOJI || '⚔️',
            delayMin: parseInt(process.env[`AUTO_REACT_DELAY_MIN_${i}`]) || parseInt(process.env.AUTO_REACT_DELAY_MIN) || 1000,
            delayMax: parseInt(process.env[`AUTO_REACT_DELAY_MAX_${i}`]) || parseInt(process.env.AUTO_REACT_DELAY_MAX) || 5000
        }
    };
    
    if (accountConfig.token) {
        accounts.push(accountConfig);
    }
}

console.log(`Loaded ${accounts.length} accounts for auto-reacting`);

// Realistic device configurations
const deviceConfigs = [
    {
        browser: 'Chrome',
        os: 'Windows',
        device: '',
        browser_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        browser_version: '122.0.0.0',
        os_version: '10',
        screen_width: 1920,
        screen_height: 1080
    },
    {
        browser: 'Chrome',
        os: 'Windows',
        device: '',
        browser_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        browser_version: '121.0.0.0',
        os_version: '10',
        screen_width: 2560,
        screen_height: 1440
    },
    {
        browser: 'Firefox',
        os: 'Windows',
        device: '',
        browser_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
        browser_version: '123.0',
        os_version: '10',
        screen_width: 1366,
        screen_height: 768
    },
    {
        browser: 'Chrome',
        os: 'Mac OS X',
        device: '',
        browser_user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        browser_version: '122.0.0.0',
        os_version: '10.15.7',
        screen_width: 2560,
        screen_height: 1440
    },
    {
        browser: 'Safari',
        os: 'Mac OS X',
        device: '',
        browser_user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
        browser_version: '17.3',
        os_version: '10.15.7',
        screen_width: 1440,
        screen_height: 900
    },
    {
        browser: 'Chrome',
        os: 'Linux',
        device: '',
        browser_user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        browser_version: '122.0.0.0',
        os_version: '',
        screen_width: 1920,
        screen_height: 1080
    },
    {
        browser: 'Firefox',
        os: 'Mac OS X',
        device: '',
        browser_user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0',
        browser_version: '123.0',
        os_version: '10.15',
        screen_width: 1680,
        screen_height: 1050
    },
    {
        browser: 'Edge',
        os: 'Windows',
        device: '',
        browser_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
        browser_version: '122.0.0.0',
        os_version: '10',
        screen_width: 1920,
        screen_height: 1080
    }
];

// Function to get random device config
function getRandomDeviceConfig() {
    return deviceConfigs[Math.floor(Math.random() * deviceConfigs.length)];
}

// Function to create proxy agent based on proxy URL
function createProxyAgent(proxyUrl) {
    if (!proxyUrl) return null;
    
    try {
        const url = new URL(proxyUrl);
        
        if (url.protocol === 'socks5:' || url.protocol === 'socks4:') {
            return new SocksProxyAgent(proxyUrl);
        } else if (url.protocol === 'http:' || url.protocol === 'https:') {
            return new HttpsProxyAgent(proxyUrl);
        } else {
            console.error(`Unsupported proxy protocol: ${url.protocol}`);
            return null;
        }
    } catch (error) {
        console.error(`Invalid proxy URL: ${proxyUrl}`, error.message);
        return null;
    }
}

// Auto react function for specific account
async function addAutoReact(message, accountConfig, client) {
    if (!accountConfig.autoReact.enabled) return;
    
    // Only react to Rumble Royale join messages (cả embed cũ và kiểu mới không embed)
    const isGameMessage = (
        // Kiểu cũ: embed join game
        (message.embeds.length > 0 && message.embeds.some(embed =>
            embed.title &&
            embed.title.includes('Rumble Royale hosted by') &&
            embed.description &&
            embed.description.includes('Click the emoji below to join')
        ))
        ||
        // Kiểu mới: không embed, interaction type APPLICATION_COMMAND, author là Rumble Royale, content rỗng
        (
            message.author &&
            message.author.username === 'Rumble Royale' &&
            message.content === '' &&
            message.interaction &&
            message.interaction.type === 'APPLICATION_COMMAND' &&
            message.interaction.commandName === 'battle'
        )
    );
    
    if (!isGameMessage) {
        console.log("❌ Not a game message - skipping reaction");
        console.log(`📝 Debug: author=${message.author?.username}, content="${message.content}", embeds=${message.embeds.length}`);
        return;
    }
    
    console.log("✅ Game message detected - will react!");
    
    try {
        // Kiểm tra xem message đã có reaction nào chưa
        if (message.reactions.cache.size > 0) {
            // Có reaction rồi → react ngay với emoji đầu tiên
            const firstReaction = message.reactions.cache.first();
            const emojiToReact = firstReaction.emoji;
            console.log(`🎯 Found existing reaction: ${firstReaction.emoji.name || firstReaction.emoji}, will use this`);
            
            // Add human-like random delay patterns
            let delay = Math.floor(Math.random() * (accountConfig.autoReact.delayMax - accountConfig.autoReact.delayMin + 1)) + accountConfig.autoReact.delayMin;
            
            // Occasionally add extra delay to simulate human behavior (10% chance)
            if (Math.random() < 0.1) {
                const extraDelay = Math.floor(Math.random() * 3000) + 1000; // 1-4 seconds extra
                delay += extraDelay;
                console.log(`Account ${accountConfig.id}: Adding human-like extra delay (+${extraDelay}ms)`);
            }
            
            await new Promise(resolve => setTimeout(resolve, delay));
            console.log(`⏰ Account ${accountConfig.id} delay: ${delay}ms for ${emojiToReact.name || emojiToReact}`);
            
            // React with the emoji
            await message.react(emojiToReact);
            console.log(`⚔️ Account ${accountConfig.id} (${client.user.username}) reacted with ${emojiToReact.name || emojiToReact} (delay: ${delay}ms)`);
            
        } else {
            // Chưa có reaction → kiểm tra liên tục trong vòng 5 phút
            const messageKey = `${message.id}_${accountConfig.id}`;
            
            // Kiểm tra xem message này đã có timer chưa
            if (pendingReactions.has(messageKey)) {
                console.log(`⚠️ Account ${accountConfig.id}: Already monitoring message ${message.id}, skipping...`);
                return;
            }
            
            console.log(`⏳ Account ${accountConfig.id}: No reactions yet, checking every 10 seconds for 5 minutes...`);
            
            const startTime = Date.now();
            const maxWaitTime = 5 * 60 * 1000; // 5 phút
            const checkInterval = 10 * 1000; // 10 giây
            let hasReacted = false;
            
            const checkForReactions = async () => {
                try {
                    if (hasReacted) {
                        // Cleanup khi đã react
                        pendingReactions.delete(messageKey);
                        return;
                    }
                    
                    const elapsedTime = Date.now() - startTime;
                    
                    if (elapsedTime >= maxWaitTime) {
                        // Hết 5 phút → dùng default emoji
                        console.log(`💭 Account ${accountConfig.id}: 5 minutes passed, using default emoji: ${accountConfig.autoReact.emoji}`);
                        
                        const delay = Math.floor(Math.random() * (accountConfig.autoReact.delayMax - accountConfig.autoReact.delayMin + 1)) + accountConfig.autoReact.delayMin;
                        await new Promise(resolve => setTimeout(resolve, delay));
                        
                        await message.react(accountConfig.autoReact.emoji);
                        console.log(`⚔️ Account ${accountConfig.id} (${client.user.username}) reacted with default ${accountConfig.autoReact.emoji} after 5min (delay: ${delay}ms)`);
                        hasReacted = true;
                        pendingReactions.delete(messageKey);
                        return;
                    }
                    
                    // Fetch lại message để kiểm tra reactions mới
                    const freshMessage = await message.fetch();
                    
                    if (freshMessage.reactions.cache.size > 0) {
                        // Tìm thấy reaction → react ngay
                        const firstReaction = freshMessage.reactions.cache.first();
                        const emojiToReact = firstReaction.emoji;
                        console.log(`🎯 Account ${accountConfig.id}: Found reaction after ${Math.round(elapsedTime/1000)}s: ${firstReaction.emoji.name || firstReaction.emoji}`);
                        
                        const delay = Math.floor(Math.random() * (accountConfig.autoReact.delayMax - accountConfig.autoReact.delayMin + 1)) + accountConfig.autoReact.delayMin;
                        await new Promise(resolve => setTimeout(resolve, delay));
                        
                        await freshMessage.react(emojiToReact);
                        console.log(`⚔️ Account ${accountConfig.id} (${client.user.username}) reacted with ${emojiToReact.name || emojiToReact} (delay: ${delay}ms)`);
                        hasReacted = true;
                        pendingReactions.delete(messageKey);
                        return;
                    }
                    
                    // Chưa có reaction → đợi và kiểm tra lại
                    console.log(`🔄 Account ${accountConfig.id}: Still no reactions after ${Math.round(elapsedTime/1000)}s, checking again...`);
                    const nextTimer = setTimeout(checkForReactions, checkInterval);
                    
                    // Update timer trong Map
                    pendingReactions.set(messageKey, { 
                        timer: nextTimer, 
                        accountId: accountConfig.id,
                        startTime: startTime
                    });
                    
                } catch (retryError) {
                    console.error(`Account ${accountConfig.id} error during retry: ${retryError.message}`);
                    // Thử lại sau 10 giây
                    if (!hasReacted && (Date.now() - startTime) < maxWaitTime) {
                        const retryTimer = setTimeout(checkForReactions, checkInterval);
                        pendingReactions.set(messageKey, { 
                            timer: retryTimer, 
                            accountId: accountConfig.id,
                            startTime: startTime
                        });
                    } else {
                        pendingReactions.delete(messageKey);
                    }
                }
            };
            
            // Bắt đầu kiểm tra sau 10 giây
            const initialTimer = setTimeout(checkForReactions, checkInterval);
            pendingReactions.set(messageKey, { 
                timer: initialTimer, 
                accountId: accountConfig.id,
                startTime: startTime
            });
        }
        
    } catch (error) {
        console.error(`Account ${accountConfig.id} failed to react: ${error.message}`);
    }
}

// Create and setup clients for each account
const clients = [];

accounts.forEach((accountConfig, index) => {
    // Get random device config for this account
    const deviceConfig = getRandomDeviceConfig();
    
    // Create client options with realistic device fingerprinting
    const clientOptions = {
        checkUpdate: false,
        autoRedeemNitro: false,
        patchVoice: false,
        ws: {
            properties: {
                browser: deviceConfig.browser,
                browser_user_agent: deviceConfig.browser_user_agent,
                browser_version: deviceConfig.browser_version,
                os: deviceConfig.os,
                os_version: deviceConfig.os_version,
                device: deviceConfig.device,
                system_locale: 'en-US',
                browser_locale: 'en-US',
                release_channel: 'stable',
                client_build_number: Math.floor(Math.random() * 1000) + 200000, // Random build number
                native_build_number: Math.floor(Math.random() * 1000) + 40000
            }
        }
    };
    
    // Add proxy if configured for this account
    if (accountConfig.proxy) {
        const proxyAgent = createProxyAgent(accountConfig.proxy);
        if (proxyAgent) {
            clientOptions.proxy = accountConfig.proxy;
            clientOptions.ws.agent = proxyAgent;
            
            // Determine proxy type for logging
            const proxyType = accountConfig.proxy.startsWith('socks') ? 'SOCKS' : 'HTTP';
            console.log(`Account ${accountConfig.id}: Using ${proxyType} proxy ${accountConfig.proxy}`);
        } else {
            console.error(`Account ${accountConfig.id}: Failed to create proxy agent for ${accountConfig.proxy}`);
        }
    }
    
    const client = new Client(clientOptions);

    client.on('ready', async () => {
        console.log(`Account ${accountConfig.id}: Logged in as ${client.user.username} (${deviceConfig.browser} on ${deviceConfig.os})`);
        
        if (accountConfig.autoReact.enabled) {
            console.log(`⚔️ Account ${accountConfig.id} auto react enabled with emoji: ${accountConfig.autoReact.emoji}`);
            console.log(`Delay range: ${accountConfig.autoReact.delayMin}ms - ${accountConfig.autoReact.delayMax}ms`);
        }
    });

    client.on('messageCreate', async (message) => {
        try {
            if (message.channel.id === accountConfig.channelId) {
                // Auto react from this account
                await addAutoReact(message, accountConfig, client);
            }
        } catch (error) {
            console.error(`Account ${accountConfig.id} error processing message:`, error);
        }
    });

    client.on('error', error => {
        console.error(`Account ${accountConfig.id} Discord client error:`, error);
    });

    // Login this account
    client.login(accountConfig.token).catch(error => {
        console.error(`Failed to login account ${accountConfig.id}:`, error);
    });

    clients.push({ client, config: accountConfig });
});

// Global error handling
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

console.log(`Started ${accounts.length} Discord accounts for auto-reacting`); 