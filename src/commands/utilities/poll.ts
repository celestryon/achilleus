import { EmbedBuilder } from 'discord.js';
import { Command, CommandCategory } from '../../types';
import { logger } from '../../utils/logger';

const command: Command = {
  name: 'poll',
  description: 'Create a poll with up to 10 options',
  category: CommandCategory.UTILITIES,
  guildOnly: true,
  options: [
    {
      name: 'question',
      description: 'The poll question',
      type: 'string',
      required: true,
    },
    {
      name: 'option1',
      description: 'Poll option 1',
      type: 'string',
      required: true,
    },
    {
      name: 'option2',
      description: 'Poll option 2',
      type: 'string',
      required: true,
    },
    {
      name: 'option3',
      description: 'Poll option 3',
      type: 'string',
      required: false,
    },
    {
      name: 'option4',
      description: 'Poll option 4',
      type: 'string',
      required: false,
    },
    {
      name: 'option5',
      description: 'Poll option 5',
      type: 'string',
      required: false,
    },
    {
      name: 'duration',
      description: 'Poll duration in minutes (default: 60, max: 10080)',
      type: 'integer',
      required: false,
    },
  ],
  async execute(interaction) {
    const question = interaction.options.getString('question', true);
    const duration = interaction.options.getInteger('duration') ?? 60;

    // Collect all options
    const options: string[] = [];
    for (let i = 1; i <= 5; i++) {
      const option = interaction.options.getString(`option${i}`);
      if (option) options.push(option);
    }

    await interaction.deferReply();

    try {
      // Validate duration (max 1 week)
      if (duration < 1 || duration > 10080) {
        await interaction.editReply({
          content: '❌ Duration must be between 1 minute and 1 week (10080 minutes).',
        });
        return;
      }

      const endTime = new Date(Date.now() + duration * 60 * 1000);
      
      // Create poll embed
      const embed = new EmbedBuilder()
        .setTitle('📊 Poll')
        .setDescription(question)
        .setColor(0x3498db)
        .addFields(
          {
            name: 'Options',
            value: options.map((option, index) => 
              `${getEmoji(index)} ${option}`
            ).join('\n'),
            inline: false,
          },
          {
            name: 'Duration',
            value: `${duration} minutes`,
            inline: true,
          },
          {
            name: 'Ends',
            value: `<t:${Math.floor(endTime.getTime() / 1000)}:R>`,
            inline: true,
          },
          {
            name: 'Results',
            value: options.map((_, index) => 
              `${getEmoji(index)} 0 votes (0%)`
            ).join('\n'),
            inline: false,
          }
        )
        .setFooter({ text: `Poll by ${interaction.user.tag}` })
        .setTimestamp();

      // Send poll message
      const message = await interaction.editReply({ embeds: [embed] });

      // Add reactions
      for (let i = 0; i < options.length; i++) {
        await message.react(getEmoji(i));
      }

      // Store poll results in memory (in a real implementation, use database)
      const pollData = {
        messageId: message.id,
        question,
        options,
        votes: new Map<string, number>(), // userId -> optionIndex
        endTime,
        authorId: interaction.user.id,
      };

      // Set up reaction handler
      const filter = (reaction: any, user: any) => {
        const emojiIndex = getEmojiIndex(reaction.emoji.name);
        return !user.bot && emojiIndex !== -1 && emojiIndex < options.length;
      };

      const collector = message.createReactionCollector({ 
        filter, 
        time: duration * 60 * 1000 
      });

      collector.on('collect', async (reaction: any, user: any) => {
        try {
          const emojiIndex = getEmojiIndex(reaction.emoji.name);
          if (emojiIndex === -1) return;

          // Remove user's previous votes
          const previousVote = pollData.votes.get(user.id);
          if (previousVote !== undefined && previousVote !== emojiIndex) {
            const previousEmoji = getEmoji(previousVote);
            const previousReaction = message.reactions.cache.get(previousEmoji);
            if (previousReaction) {
              await previousReaction.users.remove(user.id);
            }
          }

          // Record new vote
          pollData.votes.set(user.id, emojiIndex);

          // Update embed with current results
          await updatePollEmbed(message, pollData);
        } catch (error) {
          logger.error('Poll reaction error:', error);
        }
      });

      collector.on('remove', async (reaction: any, user: any) => {
        try {
          if (user.bot) return;
          
          const emojiIndex = getEmojiIndex(reaction.emoji.name);
          if (emojiIndex === -1) return;

          // Remove vote
          const currentVote = pollData.votes.get(user.id);
          if (currentVote === emojiIndex) {
            pollData.votes.delete(user.id);
            await updatePollEmbed(message, pollData);
          }
        } catch (error) {
          logger.error('Poll unreaction error:', error);
        }
      });

      collector.on('end', async () => {
        try {
          // Final results
          const finalEmbed = new EmbedBuilder()
            .setTitle('📊 Poll Results (Ended)')
            .setDescription(question)
            .setColor(0x95a5a6)
            .addFields(
              {
                name: 'Final Results',
                value: getFinalResults(pollData),
                inline: false,
              }
            )
            .setFooter({ text: `Poll by ${interaction.user.tag} • Ended` })
            .setTimestamp();

          await message.edit({ embeds: [finalEmbed] });
        } catch (error) {
          logger.error('Poll end error:', error);
        }
      });

    } catch (error) {
      logger.error('Poll command error:', error);
      await interaction.editReply({
        content: '❌ An error occurred while creating the poll.',
      });
    }
  },
};

function getEmoji(index: number): string {
  const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  return emojis[index] || '❓';
}

function getEmojiIndex(emoji: string): number {
  const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  return emojis.indexOf(emoji);
}

async function updatePollEmbed(message: any, pollData: any): Promise<void> {
  const totalVotes = pollData.votes.size;
  const voteCounts = new Array(pollData.options.length).fill(0);
  
  pollData.votes.forEach((optionIndex: number) => {
    voteCounts[optionIndex]++;
  });

  const resultsText = pollData.options.map((_option: string, index: number) => {
    const votes = voteCounts[index];
    const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
    return `${getEmoji(index)} ${votes} votes (${percentage}%)`;
  }).join('\n');

  const embed = new EmbedBuilder()
    .setTitle('📊 Poll')
    .setDescription(pollData.question)
    .setColor(0x3498db)
    .addFields(
      {
        name: 'Options',
        value: pollData.options.map((option: string, index: number) => 
          `${getEmoji(index)} ${option}`
        ).join('\n'),
        inline: false,
      },
      {
        name: 'Total Votes',
        value: totalVotes.toString(),
        inline: true,
      },
      {
        name: 'Ends',
        value: `<t:${Math.floor(pollData.endTime.getTime() / 1000)}:R>`,
        inline: true,
      },
      {
        name: 'Current Results',
        value: resultsText,
        inline: false,
      }
    )
    .setFooter({ text: `Poll by ${pollData.authorId}` })
    .setTimestamp();

  await message.edit({ embeds: [embed] });
}

function getFinalResults(pollData: any): string {
  const totalVotes = pollData.votes.size;
  const voteCounts = new Array(pollData.options.length).fill(0);
  
  pollData.votes.forEach((optionIndex: number) => {
    voteCounts[optionIndex]++;
  });

  const results = pollData.options.map((option: string, index: number) => {
    const votes = voteCounts[index];
    const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
    const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
    return `${getEmoji(index)} **${option}**\n${bar} ${votes} votes (${percentage}%)`;
  });

  return results.join('\n\n') + `\n\n**Total Votes:** ${totalVotes}`;
}

export default command;