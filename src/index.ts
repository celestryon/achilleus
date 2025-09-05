import { config } from 'dotenv';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { logger } from './utils/logger';
import { EventHandler } from './events/handler';
import { CommandHandler } from './commands/handler';
import { DatabaseService } from './services/database';
import { RedisService } from './services/redis';
import { startDashboard } from './modules/dashboard/server';

// Load environment variables
config();

// Validate required environment variables
const requiredEnvVars = ['DISCORD_TOKEN', 'DATABASE_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

class AchilleusBot {
  public client: Client;
  public db: PrismaClient;
  public redis?: Redis;
  public eventHandler: EventHandler;
  public commandHandler: CommandHandler;
  public databaseService: DatabaseService;
  public redisService?: RedisService;

  constructor() {
    // Initialize Discord client with required intents
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
      ],
    });

    // Initialize database
    this.db = new PrismaClient({
      log: ['warn', 'error'],
    });

    // Initialize Redis if URL is provided
    if (process.env['REDIS_URL']) {
      this.redis = new Redis(process.env['REDIS_URL']);
    }

    // Initialize services
    this.databaseService = new DatabaseService(this.db);
    if (this.redis) {
      this.redisService = new RedisService(this.redis);
    }

    // Initialize handlers
    this.eventHandler = new EventHandler(this);
    this.commandHandler = new CommandHandler();
  }

  public async start(): Promise<void> {
    try {
      logger.info('Starting Achilleus bot...');

      // Connect to database
      await this.db.$connect();
      logger.info('Connected to database');

      // Test Redis connection if available
      if (this.redis) {
        await this.redis.ping();
        logger.info('Connected to Redis');
      }

      // Load events and commands
      await this.eventHandler.loadEvents();
      await this.commandHandler.loadCommands();

      // Start dashboard if enabled
      if (process.env['API_PORT'] && process.env['NODE_ENV'] !== 'production') {
        await startDashboard(this);
      }

      // Login to Discord
      await this.client.login(process.env['DISCORD_TOKEN']);
      logger.info('Bot logged in successfully');

    } catch (error) {
      logger.error('Failed to start bot:', error);
      process.exit(1);
    }
  }

  public async shutdown(): Promise<void> {
    logger.info('Shutting down bot...');

    try {
      await this.client.destroy();
      await this.db.$disconnect();
      if (this.redis) {
        this.redis.disconnect();
      }
      logger.info('Bot shutdown complete');
    } catch (error) {
      logger.error('Error during shutdown:', error);
    }
  }
}

// Handle graceful shutdown
const bot = new AchilleusBot();

process.on('SIGINT', async () => {
  await bot.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await bot.shutdown();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the bot
void bot.start();