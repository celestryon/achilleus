import Redis from 'ioredis';
import { logger } from '../utils/logger';

export class RedisService {
  constructor(private redis: Redis) {}

  // Cache Management
  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.redis.setex(key, ttl, value);
      } else {
        await this.redis.set(key, value);
      }
    } catch (error) {
      logger.error('Redis set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.error('Redis del error:', error);
    }
  }

  // Rate Limiting
  async checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
    try {
      const current = await this.redis.incr(key);
      if (current === 1) {
        await this.redis.expire(key, window);
      }
      return current <= limit;
    } catch (error) {
      logger.error('Redis rate limit error:', error);
      return true; // Allow on error
    }
  }

  // Cooldown Management
  async setCooldown(userId: string, commandName: string, duration: number): Promise<void> {
    const key = `cooldown:${userId}:${commandName}`;
    await this.set(key, '1', duration);
  }

  async getCooldown(userId: string, commandName: string): Promise<number> {
    const key = `cooldown:${userId}:${commandName}`;
    try {
      const ttl = await this.redis.ttl(key);
      return ttl > 0 ? ttl : 0;
    } catch (error) {
      logger.error('Redis cooldown error:', error);
      return 0;
    }
  }

  // Guild Configuration Cache
  async cacheGuildConfig(guildId: string, config: any): Promise<void> {
    const key = `guild:${guildId}`;
    await this.set(key, JSON.stringify(config), 3600); // 1 hour TTL
  }

  async getCachedGuildConfig(guildId: string): Promise<any | null> {
    const key = `guild:${guildId}`;
    const cached = await this.get(key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        logger.error('Error parsing cached guild config:', error);
        await this.del(key);
      }
    }
    return null;
  }

  // Analytics and Metrics
  async incrementMetric(metric: string): Promise<void> {
    const key = `metric:${metric}`;
    try {
      await this.redis.incr(key);
    } catch (error) {
      logger.error('Redis metric increment error:', error);
    }
  }

  async getMetric(metric: string): Promise<number> {
    const key = `metric:${metric}`;
    try {
      const value = await this.redis.get(key);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      logger.error('Redis metric get error:', error);
      return 0;
    }
  }

  // Lock mechanism for concurrent operations
  async acquireLock(key: string, ttl: number = 10): Promise<boolean> {
    try {
      const result = await this.redis.set(`lock:${key}`, '1', 'EX', ttl, 'NX');
      return result === 'OK';
    } catch (error) {
      logger.error('Redis lock acquire error:', error);
      return false;
    }
  }

  async releaseLock(key: string): Promise<void> {
    try {
      await this.redis.del(`lock:${key}`);
    } catch (error) {
      logger.error('Redis lock release error:', error);
    }
  }
}