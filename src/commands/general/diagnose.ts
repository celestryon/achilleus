import { EmbedBuilder } from 'discord.js';
import { AchilleusBot, Command, CommandCategory } from '../../types';
import { logger } from '../../utils/logger';

const command: Command = {
  name: 'diagnose',
  description: 'Run diagnostic checks and show bot health information',
  category: CommandCategory.DIAGNOSTICS,
  permissions: ['ManageGuild'],
  guildOnly: true,
  cooldown: 30,
  async execute(interaction, bot: AchilleusBot) {
    await interaction.deferReply();

    try {
      const startTime = Date.now();

      // Database health check
      let dbHealth = '❌ Error';
      let dbLatency = 0;
      try {
        const dbStart = Date.now();
        await bot.db.$queryRaw`SELECT 1`;
        dbLatency = Date.now() - dbStart;
        dbHealth = '✅ Connected';
      } catch (error) {
        logger.error('Database health check failed:', error);
      }

      // Redis health check
      let redisHealth = '❌ Not available';
      let redisLatency = 0;
      if (bot.redis) {
        try {
          const redisStart = Date.now();
          await bot.redis.ping();
          redisLatency = Date.now() - redisStart;
          redisHealth = '✅ Connected';
        } catch (error) {
          logger.error('Redis health check failed:', error);
          redisHealth = '❌ Error';
        }
      }

      // Guild config check
      let guildConfigHealth = '❌ Error';
      try {
        const guildConfig = await bot.databaseService.getGuildConfig(interaction.guild!.id);
        guildConfigHealth = guildConfig ? '✅ Found' : '⚠️ Not configured';
      } catch (error) {
        logger.error('Guild config check failed:', error);
      }

      // Bot permissions check
      const botMember = interaction.guild!.members.me!;
      const hasBasicPerms = botMember.permissions.has(['SendMessages', 'EmbedLinks', 'UseSlashCommands']);
      const hasModPerms = botMember.permissions.has(['ModerateMembers', 'BanMembers', 'KickMembers']);
      const hasAdminPerms = botMember.permissions.has(['ManageChannels', 'ManageRoles']);

      const permissionStatus = hasBasicPerms 
        ? (hasModPerms ? (hasAdminPerms ? '✅ Full' : '⚠️ Partial (No admin)') : '⚠️ Basic only')
        : '❌ Insufficient';

      // Memory usage
      const memUsage = process.memoryUsage();
      const memUsageStr = `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`;

      const totalTime = Date.now() - startTime;

      const embed = new EmbedBuilder()
        .setTitle('🔧 Bot Diagnostics')
        .setColor(0x3498db)
        .addFields(
          {
            name: '🌐 Bot Status',
            value: `Ready: ${bot.client.isReady() ? '✅' : '❌'}\n` +
                   `Guilds: ${bot.client.guilds.cache.size}\n` +
                   `Users: ${bot.client.users.cache.size}\n` +
                   `Uptime: ${Math.floor(process.uptime() / 60)}m`,
            inline: true,
          },
          {
            name: '📊 Latency',
            value: `API: ${bot.client.ws.ping}ms\n` +
                   `Database: ${dbLatency}ms\n` +
                   `Redis: ${redisLatency}ms\n` +
                   `Check time: ${totalTime}ms`,
            inline: true,
          },
          {
            name: '🏥 Health Checks',
            value: `Database: ${dbHealth}\n` +
                   `Redis: ${redisHealth}\n` +
                   `Guild Config: ${guildConfigHealth}\n` +
                   `Permissions: ${permissionStatus}`,
            inline: true,
          },
          {
            name: '💾 System',
            value: `Memory: ${memUsageStr}\n` +
                   `Node.js: ${process.version}\n` +
                   `Platform: ${process.platform}\n` +
                   `PID: ${process.pid}`,
            inline: true,
          },
          {
            name: '📦 Commands',
            value: `Loaded: ${bot.commandHandler?.commands.size || 0}\n` +
                   `Events: ${bot.eventHandler?.events.size || 0}`,
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter({ text: `Diagnostic completed in ${totalTime}ms` });

      // Add warning if there are issues
      const issues = [];
      if (!bot.client.isReady()) issues.push('Bot not ready');
      if (dbHealth.includes('❌')) issues.push('Database connection');
      if (redisHealth.includes('❌') && bot.redis) issues.push('Redis connection');
      if (!hasBasicPerms) issues.push('Insufficient permissions');
      if (guildConfigHealth.includes('❌')) issues.push('Guild configuration');

      if (issues.length > 0) {
        embed.addFields({
          name: '⚠️ Issues Detected',
          value: issues.map(issue => `• ${issue}`).join('\n'),
          inline: false,
        });
        embed.setColor(0xff9900);
      }

      await interaction.editReply({ embeds: [embed] });

      // Increment diagnostic metric
      if (bot.redisService) {
        await bot.redisService.incrementMetric('diagnostics_run');
      }

    } catch (error) {
      logger.error('Diagnose command error:', error);
      await interaction.editReply({
        content: '❌ Failed to run diagnostics. Check logs for details.',
      });
    }
  },
};

export default command;