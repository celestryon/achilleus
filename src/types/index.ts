import { Client, Collection } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

export interface AchilleusBot {
  client: Client;
  db: PrismaClient;
  redis?: Redis;
  databaseService: any;
  redisService?: any;
  commandHandler?: any;
  eventHandler?: any;
}

export interface Command {
  name: string;
  description: string;
  category: CommandCategory;
  permissions?: string[];
  cooldown?: number;
  premiumOnly?: boolean;
  guildOnly?: boolean;
  ownerOnly?: boolean;
  options?: any[];
  execute: (interaction: any, bot: AchilleusBot) => Promise<void>;
}

export interface Event {
  name: string;
  once?: boolean;
  execute: (bot: AchilleusBot, ...args: any[]) => Promise<void>;
}

export enum CommandCategory {
  MODERATION = 'moderation',
  AUTOMOD = 'automod',
  TICKETS = 'tickets',
  UTILITIES = 'utilities',
  NOTIFICATIONS = 'notifications',
  DIAGNOSTICS = 'diagnostics',
  PRIVACY = 'privacy',
  PREMIUM = 'premium',
  GENERAL = 'general',
}

export interface GuildConfig {
  id: string;
  prefix: string;
  language: string;
  timezone: string;
  logChannelId?: string;
  modLogChannelId?: string;
  memberLogChannelId?: string;
  messageLogChannelId?: string;
  automodEnabled: boolean;
  antiRaidEnabled: boolean;
  verificationEnabled: boolean;
  muteRoleId?: string;
  moderatorRoleIds: string[];
  adminRoleIds: string[];
  premiumEnabled: boolean;
  premiumTier: number;
  retentionDays: number;
  transcriptRetentionDays: number;
}

export interface ModerationCase {
  id: string;
  caseNumber: number;
  guildId: string;
  userId: string;
  moderatorId: string;
  type: CaseType;
  reason?: string;
  duration?: number;
  evidence: string[];
  active: boolean;
  expiresAt?: Date;
  appealable: boolean;
  appealed: boolean;
  appealReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum CaseType {
  WARNING = 'WARNING',
  TIMEOUT = 'TIMEOUT',
  KICK = 'KICK',
  BAN = 'BAN',
  SOFTBAN = 'SOFTBAN',
  UNBAN = 'UNBAN',
  UNTIMEOUT = 'UNTIMEOUT',
}

export interface AutomodRule {
  id: string;
  guildId: string;
  name: string;
  type: AutomodType;
  enabled: boolean;
  triggers: Record<string, any>;
  actions: Record<string, any>;
  exemptRoles: string[];
  exemptChannels: string[];
  exemptUsers: string[];
  escalation?: Record<string, any>;
}

export enum AutomodType {
  SPAM = 'SPAM',
  LINKS = 'LINKS',
  INVITES = 'INVITES',
  MENTIONS = 'MENTIONS',
  CAPS = 'CAPS',
  EMOJIS = 'EMOJIS',
  DUPLICATES = 'DUPLICATES',
  REGEX = 'REGEX',
  PHRASES = 'PHRASES',
  RAID_PROTECTION = 'RAID_PROTECTION',
}

export interface Ticket {
  id: string;
  guildId: string;
  channelId: string;
  userId: string;
  assignedTo?: string;
  category: string;
  subject?: string;
  status: TicketStatus;
  priority: Priority;
  tags: string[];
  transcript?: string;
  slaEnabled: boolean;
  slaDeadline?: Date;
  escalated: boolean;
  escalatedAt?: Date;
  closedAt?: Date;
  closedBy?: string;
  closeReason?: string;
}

export enum TicketStatus {
  OPEN = 'OPEN',
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface CommandCollection extends Collection<string, Command> {}
export interface EventCollection extends Collection<string, Event> {}