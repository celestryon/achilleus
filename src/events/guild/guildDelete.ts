import { Events, Guild } from 'discord.js';
import { AchilleusBot, Event } from '../../types';
import { logger } from '../../utils/logger';

const event: Event = {
  name: Events.GuildDelete,
  async execute(bot: AchilleusBot, guild: Guild) {
    logger.info(`Left guild: ${guild.name} (${guild.id})`);

    try {
      // Remove cached guild configuration
      if (bot.redisService) {
        await bot.redisService.del(`guild:${guild.id}`);
      }

      // Increment guild leave metric
      if (bot.redisService) {
        await bot.redisService.incrementMetric('guilds_left');
      }

      // Note: We don't delete the guild data from the database immediately
      // This allows for data retention policies and potential guild re-invites
      // The cleanup will be handled by scheduled tasks based on retention settings
    } catch (error) {
      logger.error(`Error cleaning up guild ${guild.id}:`, error);
    }
  },
};

export default event;