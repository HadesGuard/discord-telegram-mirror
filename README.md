# Discord to Telegram Message Forwarder

This bot forwards messages from a specific Discord channel to a Telegram chat. It uses Discord.js-selfbot-v13 for Discord integration and the Telegram Bot API for message forwarding.

## Features

- Forwards messages from a specific Discord channel to Telegram
- Includes message author information
- Handles message attachments
- Error handling and logging
- Environment-based configuration

## Prerequisites

- Node.js (v14 or higher)
- A Discord user token
- A Telegram bot token
- A Telegram chat ID

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   DISCORD_TOKEN=your_discord_token_here
   DISCORD_CHANNEL_ID=your_channel_id_here
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   TELEGRAM_CHAT_ID=your_telegram_chat_id_here
   ```

## Getting the Required Tokens

### Discord Token
1. Open Discord in your web browser
2. Press F12 to open Developer Tools
3. Go to the Network tab
4. Look for requests to Discord's API
5. Find your token in the request headers

### Telegram Bot Token
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Use the `/newbot` command to create a new bot
3. Follow the instructions to set up your bot
4. Copy the API token provided

### Telegram Chat ID
1. Start a chat with your bot
2. Send a message to the bot
3. Visit `https://api.telegram.org/bot<YourBOTToken>/getUpdates`
4. Look for the "chat" object in the response
5. The "id" field is your chat ID

## Running the Bot

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Security Notes

- Never share your Discord token or Telegram bot token
- Keep your `.env` file secure and never commit it to version control
- Using self-bots is against Discord's Terms of Service. Use at your own risk.

## Error Handling

The bot includes comprehensive error handling for:
- Configuration validation
- Discord connection issues
- Telegram API errors
- Message processing errors

All errors are logged to the console for debugging purposes. 