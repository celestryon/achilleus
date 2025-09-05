import { Events, Interaction } from 'discord.js';
import { AchilleusBot, Event } from '../../types';
import { logger } from '../../utils/logger';

const event: Event = {
  name: Events.InteractionCreate,
  async execute(bot: AchilleusBot, interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = bot.commandHandler?.commands.get(interaction.commandName);
    if (!command) return;

    try {
      // Check if guild only
      if (command.guildOnly && !interaction.guild) {
        await interaction.reply({
          content: '❌ This command can only be used in servers.',
          ephemeral: true,
        });
        return;
      }

      // Check owner only
      if (command.ownerOnly && interaction.user.id !== process.env['BOT_OWNER_ID']) {
        await interaction.reply({
          content: '❌ This command is restricted to the bot owner.',
          ephemeral: true,
        });
        return;
      }

      // Check premium requirement
      if (command.premiumOnly && interaction.guild) {
        const guildConfig = await bot.databaseService.getGuildConfig(interaction.guild.id);
        if (!guildConfig?.premiumEnabled) {
          await interaction.reply({
            content: '❌ This command requires a premium subscription.',
            ephemeral: true,
          });
          return;
        }
      }

      // Check cooldown
      if (command.cooldown && bot.redisService) {
        const remaining = await bot.redisService.getCooldown(
          interaction.user.id,
          command.name
        );
        if (remaining > 0) {
          await interaction.reply({
            content: `⏰ Please wait ${remaining} seconds before using this command again.`,
            ephemeral: true,
          });
          return;
        }
      }

      // Check permissions
      if (command.permissions && interaction.guild && interaction.member) {
        const member = interaction.member as any;
        const hasPermission = command.permissions.every((permission: string) =>
          member.permissions?.has(permission)
        );

        if (!hasPermission) {
          await interaction.reply({
            content: '❌ You do not have permission to use this command.',
            ephemeral: true,
          });
          return;
        }
      }

      // Set cooldown
      if (command.cooldown && bot.redisService) {
        await bot.redisService.setCooldown(
          interaction.user.id,
          command.name,
          command.cooldown
        );
      }

      // Execute command
      await command.execute(interaction, bot);

      // Increment command usage metric
      if (bot.redisService) {
        await bot.redisService.incrementMetric(`command_${command.name}`);
        await bot.redisService.incrementMetric('commands_total');
      }

      logger.info(`Command ${command.name} executed by ${interaction.user.tag}`);
    } catch (error) {
      logger.error(`Error executing command ${command.name}:`, error);
      
      const errorMessage = '❌ An error occurred while executing this command.';
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  },
};

export default event;