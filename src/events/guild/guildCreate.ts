import { Events, Guild } from 'discord.js';
import { AchilleusBot, Event } from '../../types';
import { logger } from '../../utils/logger';

const event: Event = {
  name: Events.GuildCreate,
  async execute(bot: AchilleusBot, guild: Guild) {
    logger.info(`Joined new guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);

    try {
      // Create default guild configuration
      await bot.databaseService.createGuildConfig(guild.id, guild.name);
      
      // Cache the configuration
      if (bot.redisService) {
        const config = await bot.databaseService.getGuildConfig(guild.id);
        if (config) {
          await bot.redisService.cacheGuildConfig(guild.id, config);
        }
      }

      // Increment guild join metric
      if (bot.redisService) {
        await bot.redisService.incrementMetric('guilds_joined');
      }

      // Try to send welcome message to owner or first available channel
      try {
        const owner = await guild.fetchOwner();
        await owner.send(`👋 Thank you for adding Achilleus to **${guild.name}**!\n\n` +
          `To get started, use \`/setup\` in your server to configure the bot.\n` +
          `For help, use \`/help\` or visit our documentation.\n\n` +
          `**Important:** Make sure the bot's role is above any roles it needs to manage!`);
      } catch {
        // If DM fails, try to send to system channel or first available channel
        const channel = guild.systemChannel || 
          guild.channels.cache.find(ch => ch.type === 0 && ch.permissionsFor(guild.members.me!)?.has('SendMessages'));
        
        if (channel && 'send' in channel) {
          await channel.send(`👋 Hello! I'm Achilleus, your new moderation and utility bot.\n` +
            `Use \`/setup\` to configure me and \`/help\` for assistance!`);
        }
      }
    } catch (error) {
      logger.error(`Error setting up new guild ${guild.id}:`, error);
    }
  },
};

export default event;