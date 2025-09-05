import { Collection, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { AchilleusBot, Command, CommandCollection } from '../types';
import { logger } from '../utils/logger';

export class CommandHandler {
  public commands: CommandCollection = new Collection();

  constructor(private bot: AchilleusBot) {}

  async loadCommands(): Promise<void> {
    const commandsPath = join(__dirname, '../commands');
    try {
      const commandFolders = readdirSync(commandsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const folder of commandFolders) {
        const folderPath = join(commandsPath, folder);
        const commandFiles = readdirSync(folderPath).filter(file => 
          file.endsWith('.ts') || file.endsWith('.js')
        );

        for (const file of commandFiles) {
          const filePath = join(folderPath, file);
          try {
            // Dynamic import for TypeScript files
            const commandModule = await import(filePath);
            const command: Command = commandModule.default || commandModule;

            if (command.name && command.execute) {
              this.commands.set(command.name, command);
              logger.info(`Loaded command: ${command.name}`);
            }
          } catch (error) {
            logger.error(`Failed to load command ${file}:`, error);
          }
        }
      }

      logger.info(`Loaded ${this.commands.size} commands`);

      // Register slash commands with Discord
      await this.registerSlashCommands();
    } catch (error) {
      logger.error('Failed to load commands directory:', error);
    }
  }

  private async registerSlashCommands(): Promise<void> {
    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.DISCORD_CLIENT_ID;

    if (!token || !clientId) {
      logger.warn('Missing Discord token or client ID, skipping slash command registration');
      return;
    }

    try {
      const rest = new REST({ version: '10' }).setToken(token);
      
      const commandData = this.commands.map(command => {
        const slashCommand = new SlashCommandBuilder()
          .setName(command.name)
          .setDescription(command.description);

        if (command.options) {
          for (const option of command.options) {
            // Add options based on type
            switch (option.type) {
              case 'string':
                slashCommand.addStringOption(opt => 
                  opt.setName(option.name)
                     .setDescription(option.description)
                     .setRequired(option.required ?? false)
                );
                break;
              case 'integer':
                slashCommand.addIntegerOption(opt => 
                  opt.setName(option.name)
                     .setDescription(option.description)
                     .setRequired(option.required ?? false)
                );
                break;
              case 'user':
                slashCommand.addUserOption(opt => 
                  opt.setName(option.name)
                     .setDescription(option.description)
                     .setRequired(option.required ?? false)
                );
                break;
              case 'channel':
                slashCommand.addChannelOption(opt => 
                  opt.setName(option.name)
                     .setDescription(option.description)
                     .setRequired(option.required ?? false)
                );
                break;
              case 'role':
                slashCommand.addRoleOption(opt => 
                  opt.setName(option.name)
                     .setDescription(option.description)
                     .setRequired(option.required ?? false)
                );
                break;
              case 'boolean':
                slashCommand.addBooleanOption(opt => 
                  opt.setName(option.name)
                     .setDescription(option.description)
                     .setRequired(option.required ?? false)
                );
                break;
            }
          }
        }

        return slashCommand.toJSON();
      });

      // Register commands globally or for a specific guild
      if (process.env.DISCORD_GUILD_ID && process.env.NODE_ENV === 'development') {
        // Guild-specific registration for development
        await rest.put(
          Routes.applicationGuildCommands(clientId, process.env.DISCORD_GUILD_ID),
          { body: commandData }
        );
        logger.info('Registered slash commands for development guild');
      } else {
        // Global registration for production
        await rest.put(
          Routes.applicationCommands(clientId),
          { body: commandData }
        );
        logger.info('Registered slash commands globally');
      }
    } catch (error) {
      logger.error('Failed to register slash commands:', error);
    }
  }
}