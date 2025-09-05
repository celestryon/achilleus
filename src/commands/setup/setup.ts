import { EmbedBuilder } from 'discord.js';
import { AchilleusBot, Command, CommandCategory } from '../../types';
import { logger } from '../../utils/logger';

const command: Command = {
  name: 'setup',
  description: 'Initial setup wizard for configuring Achilleus in your server',
  category: CommandCategory.GENERAL,
  permissions: ['ManageGuild'],
  guildOnly: true,
  options: [
    {
      name: 'action',
      description: 'Setup action to perform',
      type: 'string',
      required: true,
      choices: [
        { name: 'Initialize', value: 'init' },
        { name: 'Configure Logging', value: 'logging' },
        { name: 'Configure Moderation', value: 'moderation' },
        { name: 'Show Current Config', value: 'show' },
      ],
    },
    {
      name: 'log_channel',
      description: 'Channel for general bot logs',
      type: 'channel',
      required: false,
    },
    {
      name: 'mod_log_channel',
      description: 'Channel for moderation logs',
      type: 'channel',
      required: false,
    },
    {
      name: 'mute_role',
      description: 'Role to use for timeouts/mutes',
      type: 'role',
      required: false,
    },
  ],
  async execute(interaction, bot: AchilleusBot) {
    const action = interaction.options.getString('action', true);
    const guildId = interaction.guild!.id;

    await interaction.deferReply();

    try {
      let guildConfig = await bot.databaseService.getGuildConfig(guildId);
      
      if (!guildConfig) {
        guildConfig = await bot.databaseService.createGuildConfig(
          guildId,
          interaction.guild!.name
        );
      }

      switch (action) {
        case 'init':
          await handleInit(interaction);
          break;
        case 'logging':
          await handleLogging(interaction, bot, guildConfig);
          break;
        case 'moderation':
          await handleModeration(interaction, bot, guildConfig);
          break;
        case 'show':
          await handleShow(interaction, guildConfig);
          break;
      }
    } catch (error) {
      logger.error('Setup command error:', error);
      await interaction.editReply({
        content: '❌ An error occurred during setup. Please try again.',
      });
    }
  },
};

async function handleInit(interaction: any): Promise<void> {
  const embed = new EmbedBuilder()
    .setTitle('🚀 Achilleus Setup - Initialization')
    .setDescription('Welcome to Achilleus! Let\'s get you set up.')
    .setColor(0x3498db)
    .addFields(
      {
        name: '✅ Initial Configuration Created',
        value: `Guild: ${interaction.guild.name}\nID: ${interaction.guild.id}`,
        inline: false,
      },
      {
        name: '📋 Next Steps',
        value: '• Use `/setup logging` to configure log channels\n' +
               '• Use `/setup moderation` to configure moderation settings\n' +
               '• Use `/help` to see available commands',
        inline: false,
      },
      {
        name: '⚠️ Important',
        value: 'Make sure the bot\'s role is above any roles it needs to manage!',
        inline: false,
      }
    );

  await interaction.editReply({ embeds: [embed] });
}

async function handleLogging(interaction: any, bot: AchilleusBot, config: any): Promise<void> {
  const logChannel = interaction.options.getChannel('log_channel');
  const modLogChannel = interaction.options.getChannel('mod_log_channel');

  const updates: any = {};
  if (logChannel) updates.logChannelId = logChannel.id;
  if (modLogChannel) updates.modLogChannelId = modLogChannel.id;

  if (Object.keys(updates).length > 0) {
    await bot.databaseService.updateGuildConfig(config.id, updates);
    
    // Update cache
    if (bot.redisService) {
      const updatedConfig = await bot.databaseService.getGuildConfig(config.id);
      await bot.redisService.cacheGuildConfig(config.id, updatedConfig);
    }
  }

  const embed = new EmbedBuilder()
    .setTitle('📝 Logging Configuration')
    .setColor(0x3498db)
    .addFields(
      {
        name: 'General Logs',
        value: logChannel ? `<#${logChannel.id}>` : config.logChannelId ? `<#${config.logChannelId}>` : 'Not set',
        inline: true,
      },
      {
        name: 'Moderation Logs',
        value: modLogChannel ? `<#${modLogChannel.id}>` : config.modLogChannelId ? `<#${config.modLogChannelId}>` : 'Not set',
        inline: true,
      }
    );

  if (Object.keys(updates).length > 0) {
    embed.setDescription('✅ Logging configuration updated!');
  } else {
    embed.setDescription('Current logging configuration:');
  }

  await interaction.editReply({ embeds: [embed] });
}

async function handleModeration(interaction: any, bot: AchilleusBot, config: any): Promise<void> {
  const muteRole = interaction.options.getRole('mute_role');

  const updates: any = {};
  if (muteRole) updates.muteRoleId = muteRole.id;

  if (Object.keys(updates).length > 0) {
    await bot.databaseService.updateGuildConfig(config.id, updates);
    
    // Update cache
    if (bot.redisService) {
      const updatedConfig = await bot.databaseService.getGuildConfig(config.id);
      await bot.redisService.cacheGuildConfig(config.id, updatedConfig);
    }
  }

  const embed = new EmbedBuilder()
    .setTitle('🛡️ Moderation Configuration')
    .setColor(0x3498db)
    .addFields(
      {
        name: 'Mute Role',
        value: muteRole ? `<@&${muteRole.id}>` : config.muteRoleId ? `<@&${config.muteRoleId}>` : 'Not set',
        inline: true,
      },
      {
        name: 'Automod Status',
        value: config.automodEnabled ? '✅ Enabled' : '❌ Disabled',
        inline: true,
      },
      {
        name: 'Anti-Raid Status',
        value: config.antiRaidEnabled ? '✅ Enabled' : '❌ Disabled',
        inline: true,
      }
    );

  if (Object.keys(updates).length > 0) {
    embed.setDescription('✅ Moderation configuration updated!');
  } else {
    embed.setDescription('Current moderation configuration:');
  }

  await interaction.editReply({ embeds: [embed] });
}

async function handleShow(interaction: any, config: any): Promise<void> {
  const embed = new EmbedBuilder()
    .setTitle('⚙️ Current Configuration')
    .setColor(0x3498db)
    .addFields(
      {
        name: '🏷️ Basic Info',
        value: `Prefix: \`${config.prefix}\`\nLanguage: ${config.language}\nTimezone: ${config.timezone}`,
        inline: true,
      },
      {
        name: '📝 Logging',
        value: `General: ${config.logChannelId ? `<#${config.logChannelId}>` : 'Not set'}\n` +
               `Moderation: ${config.modLogChannelId ? `<#${config.modLogChannelId}>` : 'Not set'}`,
        inline: true,
      },
      {
        name: '🛡️ Moderation',
        value: `Mute Role: ${config.muteRoleId ? `<@&${config.muteRoleId}>` : 'Not set'}\n` +
               `Automod: ${config.automodEnabled ? '✅' : '❌'}\n` +
               `Anti-Raid: ${config.antiRaidEnabled ? '✅' : '❌'}`,
        inline: true,
      },
      {
        name: '💎 Premium',
        value: `Status: ${config.premiumEnabled ? '✅ Active' : '❌ Inactive'}\n` +
               `Tier: ${config.premiumTier}`,
        inline: true,
      },
      {
        name: '🗂️ Data Retention',
        value: `Logs: ${config.retentionDays} days\n` +
               `Transcripts: ${config.transcriptRetentionDays} days`,
        inline: true,
      }
    )
    .setTimestamp()
    .setFooter({ text: 'Use /setup to modify these settings' });

  await interaction.editReply({ embeds: [embed] });
}

export default command;