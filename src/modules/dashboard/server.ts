import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AchilleusBot } from '../../types';
import { logger } from '../../utils/logger';

export async function startDashboard(bot: AchilleusBot): Promise<void> {
  const app = express();
  const port = parseInt(process.env['API_PORT'] || '3000', 10);
  const host = process.env['API_HOST'] || 'localhost';

  // Security middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      guilds: bot.client.guilds.cache.size,
      users: bot.client.users.cache.size,
      ping: bot.client.ws.ping,
    });
  });

  // Bot status endpoint
  app.get('/api/bot/status', (_req, res) => {
    res.json({
      ready: bot.client.isReady(),
      guilds: bot.client.guilds.cache.size,
      users: bot.client.users.cache.size,
      uptime: process.uptime(),
      latency: {
        api: bot.client.ws.ping,
      },
      memory: process.memoryUsage(),
    });
  });

  // Guild list endpoint (basic info only)
  app.get('/api/guilds', (_req, res) => {
    const guilds = bot.client.guilds.cache.map(guild => ({
      id: guild.id,
      name: guild.name,
      memberCount: guild.memberCount,
      icon: guild.iconURL(),
    }));
    
    res.json(guilds);
  });

  // Metrics endpoint (if Redis is available)
  app.get('/api/metrics', async (_req, res) => {
    if (!bot.redisService) {
      res.status(503).json({ error: 'Metrics service not available' });
      return;
    }

    try {
      const metrics = {
        commands_total: await bot.redisService.getMetric('commands_total'),
        guilds_joined: await bot.redisService.getMetric('guilds_joined'),
        guilds_left: await bot.redisService.getMetric('guilds_left'),
        bot_startups: await bot.redisService.getMetric('bot_startups'),
      };

      res.json(metrics);
    } catch (error) {
      logger.error('Error fetching metrics:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  // 404 handler
  app.use('*', (_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  // Error handler
  app.use((err: any, _req: any, res: any) => {
    logger.error('Dashboard API error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  // Start server
  try {
    app.listen(port, host, () => {
      logger.info(`Dashboard API listening on http://${host}:${port}`);
    });
  } catch (error) {
    logger.error('Failed to start dashboard:', error);
  }
}