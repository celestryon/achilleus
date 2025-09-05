import { EmbedBuilder } from 'discord.js';
import { AchilleusBot, Command, CommandCategory, CaseType } from '../../types';
import { logger } from '../../utils/logger';

const command: Command = {
  name: 'ban',
  description: 'Ban a user from the server',
  category: CommandCategory.MODERATION,
  permissions: ['BanMembers'],
  guildOnly: true,
  options: [
    {
      name: 'user',
      description: 'User to ban',
      type: 'user',
      required: true,
    },
    {
      name: 'reason',
      description: 'Reason for the ban',
      type: 'string',
      required: true,
    },
    {
      name: 'delete_messages',
      description: 'Delete messages from the last X days (0-7)',
      type: 'integer',
      required: false,
    },
  ],
  async execute(interaction, bot: AchilleusBot) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    const deleteMessageDays = interaction.options.getInteger('delete_messages') ?? 0;

    await interaction.deferReply();

    try {
      const guildId = interaction.guild!.id;
      const moderatorId = interaction.user.id;

      // Validate delete_messages parameter
      if (deleteMessageDays < 0 || deleteMessageDays > 7) {
        await interaction.editReply({
          content: '❌ Delete messages days must be between 0 and 7.',
        });
        return;
      }

      // Check if user is trying to ban themselves
      if (user.id === moderatorId) {
        await interaction.editReply({
          content: '❌ You cannot ban yourself.',
        });
        return;
      }

      // Check if user is trying to ban a bot
      if (user.bot) {
        await interaction.editReply({
          content: '❌ You cannot ban bots.',
        });
        return;
      }

      const guild = interaction.guild!;

      // Check if user is already banned
      try {
        const existingBan = await guild.bans.fetch(user.id);
        if (existingBan) {
          await interaction.editReply({
            content: '❌ User is already banned.',
          });
          return;
        }
      } catch {
        // User is not banned, continue
      }

      // Get the member (if they're still in the server)
      const targetMember = await guild.members.fetch(user.id).catch(() => null);

      // Check hierarchy if member exists
      if (targetMember) {
        const moderatorMember = await guild.members.fetch(moderatorId);
        if (targetMember.roles.highest.position >= moderatorMember.roles.highest.position) {
          await interaction.editReply({
            content: '❌ You cannot ban someone with a higher or equal role.',
          });
          return;
        }

        // Check if user is bannable
        if (!targetMember.bannable) {
          await interaction.editReply({
            content: '❌ I cannot ban this user. They may have a higher role than me.',
          });
          return;
        }
      }

      // Get or create member record
      await bot.databaseService.getOrCreateMember(user.id, guildId);

      // Try to DM the user before banning (only if they're in the server)
      let dmSent = false;
      if (targetMember) {
        try {
          const dmEmbed = new EmbedBuilder()
            .setTitle(`🔨 Banned from ${guild.name}`)
            .setColor(0xff0000)
            .addFields({
              name: 'Reason',
              value: reason,
              inline: false,
            })
            .setTimestamp();

          await user.send({ embeds: [dmEmbed] });
          dmSent = true;
        } catch {
          // DM failed, continue with ban
        }
      }

      // Ban the user
      await guild.bans.create(user.id, {
        reason,
        deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60,
      });

      // Create moderation case
      const moderationCase = await bot.databaseService.createCase({
        guildId,
        userId: user.id,
        moderatorId,
        type: CaseType.BAN,
        reason,
      });

      // Create response embed
      const embed = new EmbedBuilder()
        .setTitle('🔨 User Banned')
        .setColor(0xff0000)
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
            name: 'Messages Deleted',
            value: deleteMessageDays > 0 ? `${deleteMessageDays} days` : 'None',
            inline: true,
          },
          {
            name: 'DM Sent',
            value: dmSent ? '✅ Yes' : '❌ No',
            inline: true,
          }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Log to mod log channel
      const guildConfig = await bot.databaseService.getGuildConfig(guildId);
      if (guildConfig?.modLogChannelId) {
        const logChannel = guild.channels.cache.get(guildConfig.modLogChannelId);
        if (logChannel && 'send' in logChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle('📋 Ban Logged')
            .setColor(0xff0000)
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
      logger.error('Ban command error:', error);
      await interaction.editReply({
        content: '❌ An error occurred while banning the user.',
      });
    }
  },
};

export default command;