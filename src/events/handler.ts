import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { AchilleusBot, Event, EventCollection } from '../types';
import { logger } from '../utils/logger';

export class EventHandler {
  public events: EventCollection = new Collection();

  constructor(private bot: AchilleusBot) {}

  async loadEvents(): Promise<void> {
    const eventsPath = join(__dirname, '../events');
    try {
      const eventFolders = readdirSync(eventsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const folder of eventFolders) {
        const folderPath = join(eventsPath, folder);
        const eventFiles = readdirSync(folderPath).filter(file => 
          file.endsWith('.ts') || file.endsWith('.js')
        );

        for (const file of eventFiles) {
          const filePath = join(folderPath, file);
          try {
            // Dynamic import for TypeScript files
            const eventModule = await import(filePath);
            const event: Event = eventModule.default || eventModule;

            if (event.name && event.execute) {
              this.events.set(event.name, event);

              if (event.once) {
                this.bot.client.once(event.name, (...args) => 
                  event.execute(this.bot, ...args)
                );
              } else {
                this.bot.client.on(event.name, (...args) => 
                  event.execute(this.bot, ...args)
                );
              }

              logger.info(`Loaded event: ${event.name}`);
            }
          } catch (error) {
            logger.error(`Failed to load event ${file}:`, error);
          }
        }
      }

      logger.info(`Loaded ${this.events.size} events`);
    } catch (error) {
      logger.error('Failed to load events directory:', error);
    }
  }
}