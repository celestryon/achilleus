import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { GuildConfig } from '../types';

export class DatabaseService {
  constructor(private db: PrismaClient) {}

  // Guild Configuration Management
  async getGuildConfig(guildId: string): Promise<GuildConfig | null> {
    try {
      const guild = await this.db.guild.findUnique({
        where: { id: guildId },
      });
      return guild;
    } catch (error) {
      logger.error('Error fetching guild config:', error);
      return null;
    }
  }

  async createGuildConfig(guildId: string, name?: string): Promise<GuildConfig> {
    try {
      const guild = await this.db.guild.create({
        data: {
          id: guildId,
          name,
        },
      });
      logger.info(`Created guild config for ${guildId}`);
      return guild;
    } catch (error) {
      logger.error('Error creating guild config:', error);
      throw error;
    }
  }

  async updateGuildConfig(guildId: string, data: Partial<GuildConfig>): Promise<GuildConfig> {
    try {
      const guild = await this.db.guild.update({
        where: { id: guildId },
        data,
      });
      logger.info(`Updated guild config for ${guildId}`);
      return guild;
    } catch (error) {
      logger.error('Error updating guild config:', error);
      throw error;
    }
  }

  // Member Management
  async getOrCreateMember(userId: string, guildId: string): Promise<any> {
    try {
      let member = await this.db.member.findUnique({
        where: {
          userId_guildId: {
            userId,
            guildId,
          },
        },
      });

      if (!member) {
        member = await this.db.member.create({
          data: {
            userId,
            guildId,
          },
        });
      }

      return member;
    } catch (error) {
      logger.error('Error getting/creating member:', error);
      throw error;
    }
  }

  // Case Management
  async getNextCaseNumber(guildId: string): Promise<number> {
    try {
      const lastCase = await this.db.case.findFirst({
        where: { guildId },
        orderBy: { caseNumber: 'desc' },
      });

      return (lastCase?.caseNumber ?? 0) + 1;
    } catch (error) {
      logger.error('Error getting next case number:', error);
      throw error;
    }
  }

  async createCase(data: any): Promise<any> {
    try {
      const caseNumber = await this.getNextCaseNumber(data.guildId);
      const case_ = await this.db.case.create({
        data: {
          ...data,
          caseNumber,
        },
      });
      logger.info(`Created case #${caseNumber} for guild ${data.guildId}`);
      return case_;
    } catch (error) {
      logger.error('Error creating case:', error);
      throw error;
    }
  }

  // Cleanup expired data
  async cleanupExpiredData(): Promise<void> {
    try {
      const now = new Date();

      // Clean up expired cases
      await this.db.case.updateMany({
        where: {
          active: true,
          expiresAt: {
            lte: now,
          },
        },
        data: {
          active: false,
        },
      });

      // Clean up expired warnings
      await this.db.warning.updateMany({
        where: {
          active: true,
          expiresAt: {
            lte: now,
          },
        },
        data: {
          active: false,
        },
      });

      logger.info('Cleanup expired data completed');
    } catch (error) {
      logger.error('Error during data cleanup:', error);
    }
  }
}