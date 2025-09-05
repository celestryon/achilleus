import { Events } from 'discord.js';
import { AchilleusBot, Event } from '../../types';
import { logger } from '../../utils/logger';

const event: Event = {
  name: Events.ClientReady,
  once: true,
  async execute(bot: AchilleusBot) {
    logger.info(`Ready! Logged in as ${bot.client.user?.tag}`);
    logger.info(`Serving ${bot.client.guilds.cache.size} guilds with ${bot.client.users.cache.size} users`);

    // Set bot activity
    bot.client.user?.setActivity('Protecting servers | /help', { 
      type: 0 // PLAYING
    });

    // Start cleanup task
    if (bot.databaseService) {
      setInterval(async () => {
        await bot.databaseService.cleanupExpiredData();
      }, 60000 * 60); // Every hour
    }

    // Increment startup metric
    if (bot.redisService) {
      await bot.redisService.incrementMetric('bot_startups');
    }
  },
};

export default event;