import { EmbedBuilder } from 'discord.js';
import { AchilleusBot, Command, CommandCategory } from '../../types';

const command: Command = {
  name: 'ping',
  description: 'Check bot latency and responsiveness',
  category: CommandCategory.GENERAL,
  cooldown: 5,
  async execute(interaction, bot: AchilleusBot) {
    const sent = await interaction.reply({
      content: '🏓 Pinging...',
      fetchReply: true,
    });

    const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(bot.client.ws.ping);

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong!')
      .setColor(0x00ff00)
      .addFields(
        {
          name: '⚡ Roundtrip Latency',
          value: `${roundtripLatency}ms`,
          inline: true,
        },
        {
          name: '💓 API Latency',
          value: `${apiLatency}ms`,
          inline: true,
        },
        {
          name: '📊 Status',
          value: getStatusEmoji(roundtripLatency, apiLatency),
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.editReply({
      content: '',
      embeds: [embed],
    });
  },
};

function getStatusEmoji(roundtrip: number, api: number): string {
  const maxLatency = Math.max(roundtrip, api);
  
  if (maxLatency < 100) return '🟢 Excellent';
  if (maxLatency < 200) return '🟡 Good';
  if (maxLatency < 500) return '🟠 Fair';
  return '🔴 Poor';
}

export default command;