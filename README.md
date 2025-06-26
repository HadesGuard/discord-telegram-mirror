# Discord to Telegram Message Forwarder

This bot forwards messages from a specific Discord channel to a Telegram chat. It uses Discord.js-selfbot-v13 for Discord integration and the Telegram Bot API for message forwarding.

## Features

- Forwards messages from a specific Discord channel to Telegram
- Includes message author information
- Handles message attachments
- **Auto react** - automatically reacts to game-related messages with ⚔️ emoji
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
   
   # Auto React Configuration (Optional)
   AUTO_REACT_ENABLED=true
   AUTO_REACT_EMOJI=⚔️
   AUTO_REACT_DELAY_MIN=1000
   AUTO_REACT_DELAY_MAX=3000
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

## Auto React Configuration

The bot can automatically react to game-related messages in the target Discord channel with a specified emoji:

- `AUTO_REACT_ENABLED`: Enable/disable auto react (default: true)
- `AUTO_REACT_EMOJI`: Emoji to react with (default: ⚔️)
- `AUTO_REACT_DELAY_MIN`: Minimum delay in milliseconds (default: 1000ms)
- `AUTO_REACT_DELAY_MAX`: Maximum delay in milliseconds (default: 3000ms)

### Supported Game Messages:
- **Rumble Royale embeds**: Game announcements, session starts, hosted games
- **Game descriptions**: Messages containing "Starting in", "Jump!", "Feeding wolves"
- **Game fields**: Messages with participants, prizes, gold per kill info
- **Text messages**: Messages containing "rumble royale", "game", "join"

### Example:
```
AUTO_REACT_ENABLED=true
AUTO_REACT_EMOJI=⚔️
AUTO_REACT_DELAY_MIN=1000
AUTO_REACT_DELAY_MAX=4000
```

This will automatically react with ⚔️ to game-related messages with a random delay between 1-4 seconds to appear more natural.

## Multi-Account Setup

You can run multiple Discord accounts simultaneously to auto-react to games. This is useful for increasing reaction speed and having backup accounts.

**Note**: Multi-account mode focuses purely on auto-reacting. For Telegram message forwarding, use the single account mode (`npm start`).

### Configuration for Multiple Accounts:

Create a `.env` file with multiple account tokens:

```
# Number of accounts to use
NUM_ACCOUNTS=3

# Account tokens (add as many as you have)
DISCORD_TOKEN_1=your_first_account_token
DISCORD_TOKEN_2=your_second_account_token  
DISCORD_TOKEN_3=your_third_account_token

# Shared configuration
DISCORD_CHANNEL_ID=your_channel_id_here

# Auto React Configuration (applies to all accounts)
AUTO_REACT_ENABLED=true
AUTO_REACT_DELAY_MIN=1000
AUTO_REACT_DELAY_MAX=5000

# Optional: Different emojis per account
AUTO_REACT_EMOJI_1=⚔️
AUTO_REACT_EMOJI_2=🗡️
AUTO_REACT_EMOJI_3=🏹

# Optional: Different delays per account
AUTO_REACT_DELAY_MIN_1=1000
AUTO_REACT_DELAY_MAX_1=3000
AUTO_REACT_DELAY_MIN_2=2000
AUTO_REACT_DELAY_MAX_2=4000
AUTO_REACT_DELAY_MIN_3=1500
AUTO_REACT_DELAY_MAX_3=3500
```

### Running Multi-Account Mode:

```bash
# Development mode
npm run multi:dev

# Production mode  
npm run multi
```

### Features:
- **Multiple accounts**: Each account reacts independently
- **Different emojis**: Each account can use different reaction emojis
- **Staggered delays**: Different delay ranges to avoid simultaneous reactions
- **Pure auto-react**: Only handles reactions, no Telegram forwarding
- **Error isolation**: If one account fails, others continue working

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