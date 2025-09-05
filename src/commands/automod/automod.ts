import { EmbedBuilder } from 'discord.js';
import { AchilleusBot, Command, CommandCategory, AutomodType } from '../../types';
import { logger } from '../../utils/logger';

const command: Command = {
  name: 'automod',
  description: 'Configure automod rules',
  category: CommandCategory.AUTOMOD,
  permissions: ['ManageGuild'],
  guildOnly: true,
  options: [
    {
      name: 'action',
      description: 'Automod action',
      type: 'string',
      required: true,
      choices: [
        { name: 'List Rules', value: 'list' },
        { name: 'Create Rule', value: 'create' },
        { name: 'Enable Rule', value: 'enable' },
        { name: 'Disable Rule', value: 'disable' },
        { name: 'Delete Rule', value: 'delete' },
      ],
    },
    {
      name: 'type',
      description: 'Type of automod rule',
      type: 'string',
      required: false,
      choices: [
        { name: 'Spam Protection', value: 'SPAM' },
        { name: 'Link Filter', value: 'LINKS' },
        { name: 'Invite Filter', value: 'INVITES' },
        { name: 'Mention Spam', value: 'MENTIONS' },
        { name: 'Caps Filter', value: 'CAPS' },
        { name: 'Emoji Spam', value: 'EMOJIS' },
        { name: 'Duplicate Messages', value: 'DUPLICATES' },
        { name: 'Raid Protection', value: 'RAID_PROTECTION' },
      ],
    },
    {
      name: 'name',
      description: 'Name for the automod rule',
      type: 'string',
      required: false,
    },
    {
      name: 'rule_id',
      description: 'ID of the rule to modify',
      type: 'string',
      required: false,
    },
  ],
  async execute(interaction, bot: AchilleusBot) {
    const action = interaction.options.getString('action', true);
    const type = interaction.options.getString('type') as AutomodType;
    const name = interaction.options.getString('name');
    const ruleId = interaction.options.getString('rule_id');

    await interaction.deferReply();

    try {
      const guildId = interaction.guild!.id;

      switch (action) {
        case 'list':
          await handleListRules(interaction, bot, guildId);
          break;
        case 'create':
          await handleCreateRule(interaction, bot, guildId, type, name);
          break;
        case 'enable':
          await handleToggleRule(interaction, bot, ruleId, true);
          break;
        case 'disable':
          await handleToggleRule(interaction, bot, ruleId, false);
          break;
        case 'delete':
          await handleDeleteRule(interaction, bot, ruleId);
          break;
      }
    } catch (error) {
      logger.error('Automod command error:', error);
      await interaction.editReply({
        content: '❌ An error occurred while managing automod rules.',
      });
    }
  },
};

async function handleListRules(interaction: any, bot: AchilleusBot, guildId: string): Promise<void> {
  const rules = await bot.db.automodRule.findMany({
    where: { guildId },
    orderBy: { createdAt: 'desc' },
  });

  if (rules.length === 0) {
    await interaction.editReply({
      content: '📋 No automod rules configured for this server.',
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle('🛡️ Automod Rules')
    .setColor(0x3498db)
    .setDescription(`Found ${rules.length} rule(s)`);

  for (const rule of rules.slice(0, 10)) { // Limit to 10 rules
    const status = rule.enabled ? '✅ Enabled' : '❌ Disabled';
    embed.addFields({
      name: `${rule.name} (${rule.type})`,
      value: `ID: \`${rule.id}\`\nStatus: ${status}`,
      inline: true,
    });
  }

  if (rules.length > 10) {
    embed.setFooter({ text: `Showing first 10 of ${rules.length} rules` });
  }

  await interaction.editReply({ embeds: [embed] });
}

async function handleCreateRule(interaction: any, bot: AchilleusBot, guildId: string, type: AutomodType, name: string | null): Promise<void> {
  if (!type || !name) {
    await interaction.editReply({
      content: '❌ Please provide both type and name for the new rule.',
    });
    return;
  }

  // Default configurations for different rule types
  const defaultConfigs: Partial<Record<AutomodType, any>> = {
    [AutomodType.SPAM]: {
      triggers: {
        messageLimit: 5,
        timeWindow: 10, // seconds
        duplicateThreshold: 3,
      },
      actions: {
        delete: true,
        warn: true,
        timeout: 300, // 5 minutes
      },
    },
    [AutomodType.LINKS]: {
      triggers: {
        allowWhitelist: true,
        whitelist: [],
        blockAll: false,
      },
      actions: {
        delete: true,
        warn: false,
      },
    },
    [AutomodType.INVITES]: {
      triggers: {
        allowOwnServer: true,
        blockAll: false,
      },
      actions: {
        delete: true,
        warn: true,
      },
    },
    [AutomodType.MENTIONS]: {
      triggers: {
        userLimit: 5,
        roleLimit: 3,
        everyoneLimit: 1,
      },
      actions: {
        delete: true,
        warn: true,
      },
    },
    [AutomodType.CAPS]: {
      triggers: {
        percentage: 70,
        minimumLength: 10,
      },
      actions: {
        delete: true,
        warn: false,
      },
    },
    [AutomodType.EMOJIS]: {
      triggers: {
        limit: 8,
        unicodeLimit: 15,
      },
      actions: {
        delete: true,
        warn: false,
      },
    },
    [AutomodType.DUPLICATES]: {
      triggers: {
        count: 3,
        timeWindow: 30, // seconds
      },
      actions: {
        delete: true,
        warn: true,
      },
    },
    [AutomodType.RAID_PROTECTION]: {
      triggers: {
        joinLimit: 10,
        timeWindow: 60, // seconds
        accountAge: 7, // days
      },
      actions: {
        kick: true,
        lockdown: true,
        notify: true,
      },
    },
  };

  const config = defaultConfigs[type];
  if (!config) {
    await interaction.editReply({
      content: '❌ Invalid rule type.',
    });
    return;
  }

  const rule = await bot.db.automodRule.create({
    data: {
      guildId,
      name,
      type,
      triggers: config.triggers,
      actions: config.actions,
    },
  });

  const embed = new EmbedBuilder()
    .setTitle('✅ Automod Rule Created')
    .setColor(0x00ff00)
    .addFields(
      {
        name: 'Rule Name',
        value: rule.name,
        inline: true,
      },
      {
        name: 'Type',
        value: rule.type,
        inline: true,
      },
      {
        name: 'Status',
        value: '✅ Enabled',
        inline: true,
      },
      {
        name: 'Rule ID',
        value: `\`${rule.id}\``,
        inline: false,
      },
      {
        name: 'Configuration',
        value: `\`\`\`json\n${JSON.stringify(config, null, 2)}\`\`\``,
        inline: false,
      }
    )
    .setFooter({ text: 'Use /automod enable or disable to manage this rule' })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleToggleRule(interaction: any, bot: AchilleusBot, ruleId: string | null, enabled: boolean): Promise<void> {
  if (!ruleId) {
    await interaction.editReply({
      content: '❌ Please provide a rule ID.',
    });
    return;
  }

  const rule = await bot.db.automodRule.findUnique({
    where: { id: ruleId },
  });

  if (!rule) {
    await interaction.editReply({
      content: '❌ Rule not found.',
    });
    return;
  }

  if (rule.guildId !== interaction.guild!.id) {
    await interaction.editReply({
      content: '❌ Rule not found in this server.',
    });
    return;
  }

  await bot.db.automodRule.update({
    where: { id: ruleId },
    data: { enabled },
  });

  const status = enabled ? 'enabled' : 'disabled';
  const emoji = enabled ? '✅' : '❌';

  await interaction.editReply({
    content: `${emoji} Automod rule "${rule.name}" has been ${status}.`,
  });
}

async function handleDeleteRule(interaction: any, bot: AchilleusBot, ruleId: string | null): Promise<void> {
  if (!ruleId) {
    await interaction.editReply({
      content: '❌ Please provide a rule ID.',
    });
    return;
  }

  const rule = await bot.db.automodRule.findUnique({
    where: { id: ruleId },
  });

  if (!rule) {
    await interaction.editReply({
      content: '❌ Rule not found.',
    });
    return;
  }

  if (rule.guildId !== interaction.guild!.id) {
    await interaction.editReply({
      content: '❌ Rule not found in this server.',
    });
    return;
  }

  await bot.db.automodRule.delete({
    where: { id: ruleId },
  });

  await interaction.editReply({
    content: `🗑️ Automod rule "${rule.name}" has been deleted.`,
  });
}

export default command;