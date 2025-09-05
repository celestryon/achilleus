import { EmbedBuilder } from 'discord.js';
import { AchilleusBot, Command, CommandCategory, CaseType } from '../../types';
import { logger } from '../../utils/logger';

const command: Command = {
  name: 'warn',
  description: 'Issue a warning to a user',
  category: CommandCategory.MODERATION,
  permissions: ['ModerateMembers'],
  guildOnly: true,
  options: [
    {
      name: 'user',
      description: 'User to warn',
      type: 'user',
      required: true,
    },
    {
      name: 'reason',
      description: 'Reason for the warning',
      type: 'string',
      required: true,
    },
    {
      name: 'points',
      description: 'Warning points (default: 1)',
      type: 'integer',
      required: false,
    },
    {
      name: 'expires',
      description: 'Warning expiration in days (default: permanent)',
      type: 'integer',
      required: false,
    },
  ],
  async execute(interaction, bot: AchilleusBot) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    const points = interaction.options.getInteger('points') ?? 1;
    const expireDays = interaction.options.getInteger('expires');

    await interaction.deferReply();

    try {
      const guildId = interaction.guild!.id;
      const moderatorId = interaction.user.id;

      // Check if user is trying to warn themselves
      if (user.id === moderatorId) {
        await interaction.editReply({
          content: '❌ You cannot warn yourself.',
        });
        return;
      }

      // Check if user is trying to warn a bot
      if (user.bot) {
        await interaction.editReply({
          content: '❌ You cannot warn bots.',
        });
        return;
      }

      // Check hierarchy (if target is a member)
      const guild = interaction.guild!;
      const targetMember = await guild.members.fetch(user.id).catch(() => null);
      const moderatorMember = await guild.members.fetch(moderatorId);

      if (targetMember) {
        if (targetMember.roles.highest.position >= moderatorMember.roles.highest.position) {
          await interaction.editReply({
            content: '❌ You cannot warn someone with a higher or equal role.',
          });
          return;
        }
      }

      // Get or create member record
      await bot.databaseService.getOrCreateMember(user.id, guildId);

      // Calculate expiration date
      let expiresAt: Date | undefined;
      if (expireDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expireDays);
      }

      // Create warning record
      await bot.db.warning.create({
        data: {
          guildId,
          userId: user.id,
          moderatorId,
          reason,
          points,
          expiresAt,
        },
      });

      // Create moderation case
      const moderationCase = await bot.databaseService.createCase({
        guildId,
        userId: user.id,
        moderatorId,
        type: CaseType.WARNING,
        reason,
      });

      // Get total active warnings for user
      const totalWarnings = await bot.db.warning.count({
        where: {
          guildId,
          userId: user.id,
          active: true,
        },
      });

      // Create response embed
      const embed = new EmbedBuilder()
        .setTitle('⚠️ Warning Issued')
        .setColor(0xff9900)
        .addFields(
          {
            name: 'User',
            value: `${user.tag} (${user.id})`,
            inline: true,
          },
          {
            name: 'Moderator',
            value: `${interaction.user.tag}`,
            inline: true,
          },
          {
            name: 'Case #',
            value: `${moderationCase.caseNumber}`,
            inline: true,
          },
          {
            name: 'Reason',
            value: reason,
            inline: false,
          },
          {
            name: 'Points',
            value: `${points}`,
            inline: true,
          },
          {
            name: 'Expires',
            value: expireDays ? `<t:${Math.floor((expiresAt!).getTime() / 1000)}:R>` : 'Never',
            inline: true,
          },
          {
            name: 'Total Warnings',
            value: `${totalWarnings}`,
            inline: true,
          }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Try to DM the user
      try {
        const dmEmbed = new EmbedBuilder()
          .setTitle(`⚠️ Warning - ${guild.name}`)
          .setColor(0xff9900)
          .addFields(
            {
              name: 'Reason',
              value: reason,
              inline: false,
            },
            {
              name: 'Points',
              value: `${points}`,
              inline: true,
            },
            {
              name: 'Expires',
              value: expireDays ? `<t:${Math.floor((expiresAt!).getTime() / 1000)}:R>` : 'Never',
              inline: true,
            }
          )
          .setFooter({ text: `Case #${moderationCase.caseNumber}` })
          .setTimestamp();

        await user.send({ embeds: [dmEmbed] });
      } catch {
        // DM failed, that's okay
      }

      // Log to mod log channel
      const guildConfig = await bot.databaseService.getGuildConfig(guildId);
      if (guildConfig?.modLogChannelId) {
        const logChannel = guild.channels.cache.get(guildConfig.modLogChannelId);
        if (logChannel && 'send' in logChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle('📋 Warning Logged')
            .setColor(0xff9900)
            .addFields(
              {
                name: 'User',
                value: `${user.tag} (${user.id})`,
                inline: true,
              },
              {
                name: 'Moderator',
                value: `${interaction.user.tag} (${moderatorId})`,
                inline: true,
              },
              {
                name: 'Case #',
                value: `${moderationCase.caseNumber}`,
                inline: true,
              },
              {
                name: 'Reason',
                value: reason,
                inline: false,
              }
            )
            .setTimestamp();

          await logChannel.send({ embeds: [logEmbed] });
        }
      }

    } catch (error) {
      logger.error('Warn command error:', error);
      await interaction.editReply({
        content: '❌ An error occurred while issuing the warning.',
      });
    }
  },
};

export default command;