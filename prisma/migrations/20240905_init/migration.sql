-- CreateEnum
CREATE TYPE "CaseType" AS ENUM ('WARNING', 'TIMEOUT', 'KICK', 'BAN', 'SOFTBAN', 'UNBAN', 'UNTIMEOUT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'PENDING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "AutomodType" AS ENUM ('SPAM', 'LINKS', 'INVITES', 'MENTIONS', 'CAPS', 'EMOJIS', 'DUPLICATES', 'REGEX', 'PHRASES', 'RAID_PROTECTION');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'IMPLEMENTED');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('YOUTUBE', 'TWITCH', 'TIKTOK');

-- CreateTable
CREATE TABLE "guilds" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "prefix" TEXT NOT NULL DEFAULT '!',
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "logChannelId" TEXT,
    "modLogChannelId" TEXT,
    "memberLogChannelId" TEXT,
    "messageLogChannelId" TEXT,
    "automodEnabled" BOOLEAN NOT NULL DEFAULT true,
    "antiRaidEnabled" BOOLEAN NOT NULL DEFAULT true,
    "verificationEnabled" BOOLEAN NOT NULL DEFAULT false,
    "muteRoleId" TEXT,
    "moderatorRoleIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "adminRoleIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "premiumEnabled" BOOLEAN NOT NULL DEFAULT false,
    "premiumTier" INTEGER NOT NULL DEFAULT 0,
    "retentionDays" INTEGER NOT NULL DEFAULT 90,
    "transcriptRetentionDays" INTEGER NOT NULL DEFAULT 365,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guilds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nickname" TEXT,
    "roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "warnings" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "optedOut" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "caseNumber" INTEGER NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "type" "CaseType" NOT NULL,
    "reason" TEXT,
    "duration" INTEGER,
    "evidence" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "appealable" BOOLEAN NOT NULL DEFAULT true,
    "appealed" BOOLEAN NOT NULL DEFAULT false,
    "appealReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warnings" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedTo" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "subject" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "Priority" NOT NULL DEFAULT 'NORMAL',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "transcript" TEXT,
    "slaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "slaDeadline" TIMESTAMP(3),
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "escalatedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "closedBy" TEXT,
    "closeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automod_rules" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AutomodType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "triggers" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "exemptRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "exemptChannels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "exemptUsers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "escalation" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automod_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reaction_roles" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reaction_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "interval" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestions" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "staffResponse" TEXT,
    "implementedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "starboard" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "originalChannelId" TEXT NOT NULL,
    "originalMessageId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "starredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "starboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "giveaways" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "prize" TEXT NOT NULL,
    "winners" INTEGER NOT NULL DEFAULT 1,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "ended" BOOLEAN NOT NULL DEFAULT false,
    "winnerIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "participants" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requirements" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "giveaways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_notifications" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "channelId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "customMessage" TEXT,
    "lastCheck" TIMESTAMP(3),
    "lastPostId" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "members_userId_guildId_key" ON "members"("userId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "cases_guildId_caseNumber_key" ON "cases"("guildId", "caseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_channelId_key" ON "tickets"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "reaction_roles_messageId_emoji_key" ON "reaction_roles"("messageId", "emoji");

-- CreateIndex
CREATE UNIQUE INDEX "suggestions_messageId_key" ON "suggestions"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "starboard_messageId_key" ON "starboard"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "starboard_originalMessageId_key" ON "starboard"("originalMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "giveaways_messageId_key" ON "giveaways"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "social_notifications_guildId_platform_username_key" ON "social_notifications"("guildId", "platform", "username");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_userId_guildId_fkey" FOREIGN KEY ("userId", "guildId") REFERENCES "members"("userId", "guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warnings" ADD CONSTRAINT "warnings_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warnings" ADD CONSTRAINT "warnings_userId_guildId_fkey" FOREIGN KEY ("userId", "guildId") REFERENCES "members"("userId", "guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automod_rules" ADD CONSTRAINT "automod_rules_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reaction_roles" ADD CONSTRAINT "reaction_roles_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_userId_guildId_fkey" FOREIGN KEY ("userId", "guildId") REFERENCES "members"("userId", "guildId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "starboard" ADD CONSTRAINT "starboard_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "giveaways" ADD CONSTRAINT "giveaways_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_notifications" ADD CONSTRAINT "social_notifications_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;