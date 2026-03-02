import { Events, Message, ChannelType } from 'discord.js';
import coreApi from '../utils/api-client';
import { log } from '../utils/logger';

export default {
    name: Events.MessageCreate,
    once: false,
    async execute(message: Message) {
        // Ignorar mensagens de bots
        if (message.author.bot) return;

        // Apenas mensagens enviadas em canais dentro de servidores
        if (!message.guild || message.channel.type !== ChannelType.GuildText) return;

        // Aceitar canais que começam com "ticket-" ou "tkt-"
        if (!message.channel.name.startsWith('ticket-') && !message.channel.name.startsWith('tkt-')) return;

        // Se o usu\u00e1rio tem permiss\u00e3o para gerenciar canais ou \u00e9 o Admin, marca como Staff
        const isStaff = message.member?.permissions.has('ManageChannels') || message.member?.permissions.has('Administrator') || false;

        try {
            await coreApi.post('/internal/tickets/messages', {
                discordGuildId: message.guild.id,
                channelId: message.channel.id,
                authorId: message.author.id,
                authorName: message.author.username,
                authorAvatar: message.author.displayAvatarURL(),
                content: message.content,
                isStaff
            });
            log.api(`Mensagem de ${message.author.username} recebida no ticket ${message.channel.id}.`);
        } catch (error: any) {
            // Ignora silenciosamente se der 404 (n\u00e3o \u00e9 um canal de ticket v\u00e1lido na DB)
            if (error.response && error.response.status === 404) {
                return;
            }
            log.error(`Erro ao salvar mensagem do ticket: ${error.message}`);
        }
    }
};
