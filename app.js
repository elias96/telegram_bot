import TelegramBot from 'node-telegram-bot-api';
import 'dotenv/config';
import * as si from 'systeminformation';

const token = process.env.TELEGRAM_BOT;

if (!token) {
  console.error('TELEGRAM_BOT token is missing from .env file.');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// Function to send a message with inline keyboard buttons
function sendCommandButtons(chatId) {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Command list', callback_data: 'help' }],
        [{ text: 'Hardware info', callback_data: 'systeminfo' }],
      ],
    },
  };
  bot.sendMessage(chatId, 'The following commands are available', options);
}

// Listen for callback queries
bot.on('callback_query', async (callbackQuery) => {
  const msg = callbackQuery.message;

  if (!msg.from.id === 6343865041) {
    bot.sendMessage(msg.chat.id, 'You are not authorized to use this bot.');
    return;
  }

  const command = callbackQuery.data;

  if (command === 'systeminfo') {
    const temp = await si.cpuTemperature();
    console.log(JSON.stringify(temp, null, 2));
    bot.sendMessage(msg.chat.id, `The CPU temperature is ${temp.chipset}°C.`);

    const load = await si.currentLoad();
    bot.sendMessage(msg.chat.id, `The CPU load is ${load.avgLoad}%.`);
  } else if (command === 'help') {
    sendCommandButtons(msg.chat.id);
  }
});

bot.onText(/^commands|cmds|help$/i, (msg, match) => {
  if (msg.from.id !== 6343865041) {
    bot.sendMessage(msg.chat.id, 'You are not authorized to use this bot.');
    return;
  }

  console.log(JSON.stringify(msg, null, 2));
  const chatId = msg.chat.id;
  sendCommandButtons(chatId);
});
