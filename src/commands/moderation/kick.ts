import { EmbedBuilder } from 'discord.js';
import { AchilleusBot, Command, CommandCategory, CaseType } from '../../types';
import { logger } from '../../utils/logger';

const command: Command = {
  name: 'kick',
  description: 'Kick a user from the server',
  category: CommandCategory.MODERATION,
  permissions: ['KickMembers'],
  guildOnly: true,
  options: [
    {
      name: 'user',
      description: 'User to kick',
      type: 'user',
      required: true,
    },
    {
      name: 'reason',
      description: 'Reason for the kick',
      type: 'string',
      required: true,
    },
  ],
  async execute(interaction, bot: AchilleusBot) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);

    await interaction.deferReply();

    try {
      const guildId = interaction.guild!.id;
      const moderatorId = interaction.user.id;

      // Check if user is trying to kick themselves
      if (user.id === moderatorId) {
        await interaction.editReply({
          content: '❌ You cannot kick yourself.',
        });
        return;
      }

      // Check if user is trying to kick a bot
      if (user.bot) {
        await interaction.editReply({
          content: '❌ You cannot kick bots.',
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
          content: '❌ You cannot kick someone with a higher or equal role.',
        });
        return;
      }

      // Check if user is kickable
      if (!targetMember.kickable) {
        await interaction.editReply({
          content: '❌ I cannot kick this user. They may have a higher role than me.',
        });
        return;
      }

      // Get or create member record
      await bot.databaseService.getOrCreateMember(user.id, guildId);

      // Try to DM the user before kicking
      let dmSent = false;
      try {
        const dmEmbed = new EmbedBuilder()
          .setTitle(`👢 Kicked from ${guild.name}`)
          .setColor(0xff6b00)
          .addFields({
            name: 'Reason',
            value: reason,
            inline: false,
          })
          .setTimestamp();

        await user.send({ embeds: [dmEmbed] });
        dmSent = true;
      } catch {
        // DM failed, continue with kick
      }

      // Kick the user
      await targetMember.kick(reason);

      // Create moderation case
      const moderationCase = await bot.databaseService.createCase({
        guildId,
        userId: user.id,
        moderatorId,
        type: CaseType.KICK,
        reason,
      });

      // Create response embed
      const embed = new EmbedBuilder()
        .setTitle('👢 User Kicked')
        .setColor(0xff6b00)
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
            .setTitle('📋 Kick Logged')
            .setColor(0xff6b00)
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
      logger.error('Kick command error:', error);
      await interaction.editReply({
        content: '❌ An error occurred while kicking the user.',
      });
    }
  },
};

export default command;