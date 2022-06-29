import { config } from 'dotenv';
config();

import { Telegraf, Context } from 'telegraf';
import { searchResponse } from './responses.js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome'));

bot.on('inline_query', async ctx => {
    try {
        const response = await search(ctx.inlineQuery.query);
        ctx.answerInlineQuery(response);
    } catch(e) {
        console.error(e);
    }
});
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

/**
 * Search for responses
 * @param string query 
 */
async function search(query, limit = 50)
{
    let result = [];
    console.log(`Searching for '${query}'...`);
    let heroResponses = await searchResponse(query);
    heroResponses.forEach(r => {
        result.push({
            type: 'audio',
            id: r.id,
            audio_url: r.response_link,
            title: r.original_text,
            performer: r.hero_name,
            caption: `${r.hero_name}: ${r.original_text}`
        });
    })
    console.log(`${result.length} results`);
    return result;
}
