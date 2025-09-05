import { EmbedBuilder } from 'discord.js';
import { AchilleusBot, Command, CommandCategory } from '../../types';

const command: Command = {
  name: 'help',
  description: 'Show help information and available commands',
  category: CommandCategory.GENERAL,
  options: [
    {
      name: 'command',
      description: 'Get help for a specific command',
      type: 'string',
      required: false,
    },
  ],
  async execute(interaction, bot: AchilleusBot) {
    const commandName = interaction.options.getString('command');

    if (commandName) {
      // Show help for specific command
      const command = bot.commandHandler?.commands.get(commandName);
      if (!command) {
        await interaction.reply({
          content: `❌ Command \`${commandName}\` not found.`,
          ephemeral: true,
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`Help: /${command.name}`)
        .setDescription(command.description)
        .setColor(0x3498db)
        .addFields(
          { name: 'Category', value: command.category, inline: true },
          { name: 'Cooldown', value: command.cooldown ? `${command.cooldown}s` : 'None', inline: true },
          { name: 'Premium Only', value: command.premiumOnly ? 'Yes' : 'No', inline: true }
        );

      if (command.permissions && command.permissions.length > 0) {
        embed.addFields({
          name: 'Required Permissions',
          value: command.permissions.join(', '),
          inline: false,
        });
      }

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      // Show general help
      const commands = bot.commandHandler?.commands;
      if (!commands) {
        await interaction.reply({
          content: '❌ Commands not loaded.',
          ephemeral: true,
        });
        return;
      }

      // Group commands by category
      const categories = new Map<string, Command[]>();
      commands.forEach((cmd: Command) => {
        const category = cmd.category;
        if (!categories.has(category)) {
          categories.set(category, []);
        }
        categories.get(category)!.push(cmd);
      });

      const embed = new EmbedBuilder()
        .setTitle('🛡️ Achilleus - Help')
        .setDescription('Achilleus is an all-in-one Discord bot for moderation, utilities, and community management.')
        .setColor(0x3498db)
        .setFooter({
          text: 'Use /help <command> for detailed command information',
        });

      // Add fields for each category
      categories.forEach((cmds, categoryName) => {
        const commandList = cmds
          .map(cmd => `\`/${cmd.name}\` - ${cmd.description}`)
          .join('\n');

        embed.addFields({
          name: `📁 ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}`,
          value: commandList.length > 1024 ? commandList.substring(0, 1021) + '...' : commandList,
          inline: false,
        });
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};

export default command;