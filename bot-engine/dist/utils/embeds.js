"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEmbed = buildEmbed;
exports.ticketOpenedEmbed = ticketOpenedEmbed;
exports.ticketClosedEmbed = ticketClosedEmbed;
exports.guildWelcomeEmbed = guildWelcomeEmbed;
const discord_js_1 = require("discord.js");
const colorMap = {
    success: discord_js_1.Colors.Green,
    error: discord_js_1.Colors.Red,
    info: discord_js_1.Colors.Blurple,
    warning: discord_js_1.Colors.Yellow,
    ticket: 0x5865F2,
};
function buildEmbed(opts) {
    const embed = new discord_js_1.EmbedBuilder()
        .setColor(colorMap[opts.type])
        .setTitle(opts.title)
        .setTimestamp();
    if (opts.description)
        embed.setDescription(opts.description);
    if (opts.fields?.length)
        embed.addFields(opts.fields);
    if (opts.footer)
        embed.setFooter({ text: opts.footer });
    if (opts.thumbnail)
        embed.setThumbnail(opts.thumbnail);
    return embed;
}
function ticketOpenedEmbed(username, subject, ticketId) {
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
function ticketClosedEmbed(username, closedBy) {
    return buildEmbed({
        type: 'success',
        title: '✅ Ticket Encerrado',
        description: `O ticket de **${username}** foi encerrado por **${closedBy}**.`,
        footer: 'SaaSBot • Sistema de Tickets',
    });
}
function guildWelcomeEmbed(guildName) {
    const dashboardUrl = process.env.DASHBOARD_URL || 'https://orbitup.io';
    return buildEmbed({
        type: 'info',
        title: '🛰️ Olá! Sou o OrbitOS',
        description: `Obrigado por me adicionar ao servidor **${guildName}**!\n\nUse o painel web para configurar canais de tickets, automações e roles de staff.\n\n[→ Abrir Dashboard](${dashboardUrl}/dashboard)`,
        footer: 'OrbitOS • Plataforma SaaS',
    });
}
