import {
    EmbedBuilder,
    Colors,
    ColorResolvable,
} from 'discord.js';

type EmbedType = 'success' | 'error' | 'info' | 'warning' | 'ticket';

const colorMap: Record<EmbedType, ColorResolvable> = {
    success: Colors.Green,
    error: Colors.Red,
    info: Colors.Blurple,
    warning: Colors.Yellow,
    ticket: 0x5865F2,
};

interface EmbedOptions {
    type: EmbedType;
    title: string;
    description?: string;
    fields?: { name: string; value: string; inline?: boolean }[];
    footer?: string;
    thumbnail?: string;
}

export function buildEmbed(opts: EmbedOptions): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setColor(colorMap[opts.type])
        .setTitle(opts.title)
        .setTimestamp();

    if (opts.description) embed.setDescription(opts.description);
    if (opts.fields?.length) embed.addFields(opts.fields);
    if (opts.footer) embed.setFooter({ text: opts.footer });
    if (opts.thumbnail) embed.setThumbnail(opts.thumbnail);

    return embed;
}

export function ticketOpenedEmbed(username: string, subject: string, ticketId: string) {
    return buildEmbed({
        type: 'ticket',
        title: '🎫 Novo Ticket Aberto',
        description: `**${username}** abriu um ticket. Aguarde o atendimento da nossa equipe!`,
        fields: [
            { name: '📋 Assunto', value: subject, inline: false },
            { name: '🆔 Ticket ID', value: `\`${ticketId}\``, inline: true },
            { name: '📊 Status', value: '`ABERTO`', inline: true },
        ],
        footer: 'SaaSBot • Sistema de Tickets',
    });
}

export function ticketClosedEmbed(username: string, closedBy: string) {
    return buildEmbed({
        type: 'success',
        title: '✅ Ticket Encerrado',
        description: `O ticket de **${username}** foi encerrado por **${closedBy}**.`,
        footer: 'SaaSBot • Sistema de Tickets',
    });
}

export function guildWelcomeEmbed(guildName: string) {
    const dashboardUrl = process.env.DASHBOARD_URL || 'https://orbitup.io';
    return buildEmbed({
        type: 'info',
        title: '🛰️ Olá! Sou o OrbitOS',
        description: `Obrigado por me adicionar ao servidor **${guildName}**!\n\nUse o painel web para configurar canais de tickets, automações e roles de staff.\n\n[→ Abrir Dashboard](${dashboardUrl}/dashboard)`,
        footer: 'OrbitOS • Plataforma SaaS',
    });
}

