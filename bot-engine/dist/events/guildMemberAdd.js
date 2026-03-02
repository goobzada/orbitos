"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const logger_1 = require("../utils/logger");
const api_client_1 = __importDefault(require("../utils/api-client"));
exports.default = {
    name: discord_js_1.Events.GuildMemberAdd,
    once: false,
    async execute(member) {
        const guild = member.guild;
        logger_1.log.event(`Novo membro: ${member.user.tag} em ${guild.name}`);
        // Notifica Core API (para auto-role e registro)
        try {
            const { data } = await api_client_1.default.post('/internal/members/join', {
                discordGuildId: guild.id,
                userId: member.id,
                username: member.user.username,
                avatar: member.user.avatarURL(),
            });
            // Se a API mandar cargos para aplicar automaticamente
            if (data?.autoRoles?.length) {
                for (const roleId of data.autoRoles) {
                    const role = guild.roles.cache.get(roleId);
                    if (role) {
                        await member.roles.add(role).catch(() => null);
                        logger_1.log.info(`Auto-role "${role.name}" aplicado em ${member.user.tag}`);
                    }
                }
            }
            // Posta log no canal configurado
            if (data?.logChannelId) {
                const logChannel = guild.channels.cache.get(data.logChannelId);
                if (logChannel) {
                    const embed = new discord_js_1.EmbedBuilder()
                        .setColor(0x57F287)
                        .setTitle('📥 Novo Membro')
                        .setThumbnail(member.user.avatarURL())
                        .addFields({ name: '👤 Usuário', value: `<@${member.id}> — ${member.user.username}`, inline: false }, { name: '🆔 ID', value: member.id, inline: true }, { name: '📅 Conta criada', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true })
                        .setFooter({ text: `Total de membros: ${guild.memberCount}` })
                        .setTimestamp();
                    await logChannel.send({ embeds: [embed] });
                }
            }
        }
        catch (err) {
            logger_1.log.warn(`Erro ao processar entrada de ${member.user.tag}: ${err.message}`);
        }
    }
};
