require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const { SocksProxyAgent } = require('socks-proxy-agent');
const { HttpsProxyAgent } = require('https-proxy-agent');

// Multi-account configuration
const accounts = [];
const numAccounts = parseInt(process.env.NUM_ACCOUNTS) || 1;

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
    console.log("addAutoReact", accountConfig.autoReact.enabled);
    if (!accountConfig.autoReact.enabled) return;
    
    // Only react to game-related messages
    const isGameMessage = 
        (message.embeds.length > 0 && message.embeds.some(embed => 
            (embed.title && (
                embed.title.includes('Rumble Royale') ||
                embed.title.includes('Started a new Rumble Royale session') ||
                embed.title.startsWith('Rumble Royale hosted by')
            )) ||
            (embed.description && (
                embed.description.includes('Starting in') ||
                embed.description.includes('Jump!') ||
                embed.description.includes('Feeding wolves')
            )) ||
            (embed.fields && embed.fields.some(field => 
                field.name.includes('participants') ||
                field.name.includes('Prize') ||
                field.name.includes('Gold Per Kill')
            ))
        )) ||
        (message.content && (
            message.content.toLowerCase().includes('rumble royale') ||
            message.content.toLowerCase().includes('game') ||
            message.content.toLowerCase().includes('join')
        ));
    
    if (!isGameMessage) return;
    
    try {
        // Add human-like random delay patterns
        let delay = Math.floor(Math.random() * (accountConfig.autoReact.delayMax - accountConfig.autoReact.delayMin + 1)) + accountConfig.autoReact.delayMin;
        
        // Occasionally add extra delay to simulate human behavior (10% chance)
        if (Math.random() < 0.1) {
            const extraDelay = Math.floor(Math.random() * 3000) + 1000; // 1-4 seconds extra
            delay += extraDelay;
            console.log(`Account ${accountConfig.id}: Adding human-like extra delay (+${extraDelay}ms)`);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log("delay", delay);
        
        // React with the configured emoji
        await message.react(accountConfig.autoReact.emoji);
        console.log(`⚔️ Account ${accountConfig.id} (${client.user.username}) reacted with ${accountConfig.autoReact.emoji} (delay: ${delay}ms)`);
        
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