import { EmbedBuilder } from 'discord.js';
import { AchilleusBot, Command, CommandCategory, CaseType } from '../../types';
import { logger } from '../../utils/logger';

const command: Command = {
  name: 'timeout',
  description: 'Timeout a user for a specified duration',
  category: CommandCategory.MODERATION,
  permissions: ['ModerateMembers'],
  guildOnly: true,
  options: [
    {
      name: 'user',
      description: 'User to timeout',
      type: 'user',
      required: true,
    },
    {
      name: 'duration',
      description: 'Timeout duration in minutes (max 40320 = 28 days)',
      type: 'integer',
      required: true,
    },
    {
      name: 'reason',
      description: 'Reason for the timeout',
      type: 'string',
      required: true,
    },
  ],
  async execute(interaction, bot: AchilleusBot) {
    const user = interaction.options.getUser('user', true);
    const duration = interaction.options.getInteger('duration', true);
    const reason = interaction.options.getString('reason', true);

    await interaction.deferReply();

    try {
      const guildId = interaction.guild!.id;
      const moderatorId = interaction.user.id;

      // Validate duration (Discord limit is 28 days = 40320 minutes)
      if (duration < 1 || duration > 40320) {
        await interaction.editReply({
          content: '❌ Duration must be between 1 minute and 28 days (40320 minutes).',
        });
        return;
      }

      // Check if user is trying to timeout themselves
      if (user.id === moderatorId) {
        await interaction.editReply({
          content: '❌ You cannot timeout yourself.',
        });
        return;
      }

      // Check if user is trying to timeout a bot
      if (user.bot) {
        await interaction.editReply({
          content: '❌ You cannot timeout bots.',
        });
        return;
      }

      // Get the member
      const guild = interaction.guild!;
      const targetMember = await guild.members.fetch(user.id).catch(() => null);

      if (!targetMember) {
        await interaction.editReply({
          content: '❌ User is not a member of this server.',
        });
        return;
      }

      // Check hierarchy
      const moderatorMember = await guild.members.fetch(moderatorId);
      if (targetMember.roles.highest.position >= moderatorMember.roles.highest.position) {
        await interaction.editReply({
          content: '❌ You cannot timeout someone with a higher or equal role.',
        });
        return;
      }

      // Check if user is already timed out
      if (targetMember.communicationDisabledUntil && targetMember.communicationDisabledUntil > new Date()) {
        await interaction.editReply({
          content: '❌ User is already timed out.',
        });
        return;
      }

      // Get or create member record
      await bot.databaseService.getOrCreateMember(user.id, guildId);

      // Calculate timeout end time
      const timeoutEnd = new Date();
      timeoutEnd.setMinutes(timeoutEnd.getMinutes() + duration);

      // Apply timeout
      await targetMember.timeout(duration * 60 * 1000, reason);

      // Create moderation case
      const moderationCase = await bot.databaseService.createCase({
        guildId,
        userId: user.id,
        moderatorId,
        type: CaseType.TIMEOUT,
        reason,
        duration,
        expiresAt: timeoutEnd,
      });

      // Create response embed
      const embed = new EmbedBuilder()
        .setTitle('⏱️ User Timed Out')
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
            name: 'Duration',
            value: `${duration} minutes`,
            inline: true,
          },
          {
            name: 'Expires',
            value: `<t:${Math.floor(timeoutEnd.getTime() / 1000)}:R>`,
            inline: true,
          },
          {
            name: 'Reason',
            value: reason,
            inline: false,
          }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Try to DM the user
      try {
        const dmEmbed = new EmbedBuilder()
          .setTitle(`⏱️ Timed Out - ${guild.name}`)
          .setColor(0xff9900)
          .addFields(
            {
              name: 'Duration',
              value: `${duration} minutes`,
              inline: true,
            },
            {
              name: 'Expires',
              value: `<t:${Math.floor(timeoutEnd.getTime() / 1000)}:R>`,
              inline: true,
            },
            {
              name: 'Reason',
              value: reason,
              inline: false,
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
            .setTitle('📋 Timeout Logged')
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
                name: 'Duration',
                value: `${duration} minutes`,
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
      logger.error('Timeout command error:', error);
      await interaction.editReply({
        content: '❌ An error occurred while timing out the user.',
      });
    }
  },
};

export default command;