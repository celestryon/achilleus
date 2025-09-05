import { DatabaseService } from '../services/database';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
const mockPrismaClient = {
  guild: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  member: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  case: {
    findFirst: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
  },
  warning: {
    updateMany: jest.fn(),
  },
  $queryRaw: jest.fn(),
} as unknown as PrismaClient;

describe('DatabaseService', () => {
  let databaseService: DatabaseService;

  beforeEach(() => {
    databaseService = new DatabaseService(mockPrismaClient);
    jest.clearAllMocks();
  });

  describe('getGuildConfig', () => {
    it('should return guild config when found', async () => {
      const mockGuild = { id: 'test-guild', name: 'Test Guild' };
      (mockPrismaClient.guild.findUnique as jest.Mock).mockResolvedValue(mockGuild);

      const result = await databaseService.getGuildConfig('test-guild');

      expect(result).toEqual(mockGuild);
      expect(mockPrismaClient.guild.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-guild' },
      });
    });

    it('should return null when guild not found', async () => {
      (mockPrismaClient.guild.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await databaseService.getGuildConfig('test-guild');

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      (mockPrismaClient.guild.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await databaseService.getGuildConfig('test-guild');

      expect(result).toBeNull();
    });
  });

  describe('createGuildConfig', () => {
    it('should create and return guild config', async () => {
      const mockGuild = { id: 'test-guild', name: 'Test Guild' };
      (mockPrismaClient.guild.create as jest.Mock).mockResolvedValue(mockGuild);

      const result = await databaseService.createGuildConfig('test-guild', 'Test Guild');

      expect(result).toEqual(mockGuild);
      expect(mockPrismaClient.guild.create).toHaveBeenCalledWith({
        data: {
          id: 'test-guild',
          name: 'Test Guild',
        },
      });
    });
  });

  describe('getNextCaseNumber', () => {
    it('should return 1 for first case', async () => {
      (mockPrismaClient.case.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await databaseService.getNextCaseNumber('test-guild');

      expect(result).toBe(1);
    });

    it('should return incremented case number', async () => {
      (mockPrismaClient.case.findFirst as jest.Mock).mockResolvedValue({ caseNumber: 5 });

      const result = await databaseService.getNextCaseNumber('test-guild');

      expect(result).toBe(6);
    });
  });
});