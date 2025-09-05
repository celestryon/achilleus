import { EmbedBuilder } from 'discord.js';
import { AchilleusBot, Command, CommandCategory } from '../../types';
import { logger } from '../../utils/logger';

const command: Command = {
  name: 'reminder',
  description: 'Set a reminder',
  category: CommandCategory.UTILITIES,
  guildOnly: true,
  options: [
    {
      name: 'time',
      description: 'Time until reminder (e.g., 5m, 1h, 2d)',
      type: 'string',
      required: true,
    },
    {
      name: 'message',
      description: 'Reminder message',
      type: 'string',
      required: true,
    },
  ],
  async execute(interaction, bot: AchilleusBot) {
    const timeStr = interaction.options.getString('time', true);
    const message = interaction.options.getString('message', true);

    await interaction.deferReply();

    try {
      // Parse time string
      const timeMs = parseTimeString(timeStr);
      if (timeMs === null) {
        await interaction.editReply({
          content: '❌ Invalid time format. Use formats like: 5m, 1h, 2d, 1w',
        });
        return;
      }

      // Check time limits (max 1 year)
      const maxTime = 365 * 24 * 60 * 60 * 1000; // 1 year in ms
      if (timeMs > maxTime) {
        await interaction.editReply({
          content: '❌ Reminder time cannot exceed 1 year.',
        });
        return;
      }

      const minTime = 60 * 1000; // 1 minute in ms
      if (timeMs < minTime) {
        await interaction.editReply({
          content: '❌ Reminder time must be at least 1 minute.',
        });
        return;
      }

      const remindAt = new Date(Date.now() + timeMs);
      const guildId = interaction.guild!.id;
      const userId = interaction.user.id;
      const channelId = interaction.channel!.id;

      // Get or create member record
      await bot.databaseService.getOrCreateMember(userId, guildId);

      // Create reminder
      const reminder = await bot.db.reminder.create({
        data: {
          guildId,
          userId,
          channelId,
          content: message,
          remindAt,
        },
      });

      const embed = new EmbedBuilder()
        .setTitle('⏰ Reminder Set')
        .setColor(0x00ff00)
        .addFields(
          {
            name: 'Message',
            value: message,
            inline: false,
          },
          {
            name: 'Remind At',
            value: `<t:${Math.floor(remindAt.getTime() / 1000)}:F>`,
            inline: true,
          },
          {
            name: 'Relative Time',
            value: `<t:${Math.floor(remindAt.getTime() / 1000)}:R>`,
            inline: true,
          }
        )
        .setFooter({ text: `Reminder ID: ${reminder.id}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Schedule the reminder (in a real implementation, you'd use a job queue)
      setTimeout(async () => {
        try {
          const channel = bot.client.channels.cache.get(channelId);
          if (channel && 'send' in channel) {
            const reminderEmbed = new EmbedBuilder()
              .setTitle('⏰ Reminder')
              .setDescription(message)
              .setColor(0x00ff00)
              .setFooter({ text: `Set ${timeStr} ago` })
              .setTimestamp();

            await channel.send({
              content: `<@${userId}>`,
              embeds: [reminderEmbed],
            });

            // Mark reminder as completed
            await bot.db.reminder.update({
              where: { id: reminder.id },
              data: { active: false },
            });
          }
        } catch (error) {
          logger.error('Reminder execution error:', error);
        }
      }, timeMs);

    } catch (error) {
      logger.error('Reminder command error:', error);
      await interaction.editReply({
        content: '❌ An error occurred while setting the reminder.',
      });
    }
  },
};

function parseTimeString(timeStr: string): number | null {
  const regex = /^(\d+)([smhdw])$/i;
  const match = timeStr.match(regex);

  if (!match || !match[1] || !match[2]) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const multipliers: Record<string, number> = {
    s: 1000,           // seconds
    m: 60 * 1000,      // minutes
    h: 60 * 60 * 1000, // hours
    d: 24 * 60 * 60 * 1000, // days
    w: 7 * 24 * 60 * 60 * 1000, // weeks
  };

  const multiplier = multipliers[unit];
  if (!multiplier) return null;

  return value * multiplier;
}

export default command;