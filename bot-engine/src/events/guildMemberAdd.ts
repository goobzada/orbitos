import { Events, GuildMember, EmbedBuilder, TextChannel } from 'discord.js';
import { log } from '../utils/logger';
import coreApi from '../utils/api-client';
import { InviteTracker } from '../utils/InviteTracker';

export default {
    name: Events.GuildMemberAdd,
    once: false,
    async execute(member: GuildMember) {
        const guild = member.guild;
        log.event(`Novo membro: ${member.user.tag} em ${guild.name}`);

        // Tenta descobrir quem convidou
        const invite = await InviteTracker.findInviter(guild);
        if (invite && invite.inviter) {
            try {
                await coreApi.post('/internal/referrals/add', {
                    discordGuildId: guild.id,
                    referrerId: invite.inviter.id,
                    referredId: member.id
                });
                log.info(`[REFERRAL] ${member.user.tag} foi convidado por ${invite.inviter.tag}`);
            } catch (err: any) {
                log.error(`[REFERRAL] Erro ao registrar indicação: ${err.message}`);
            }
        }

        // Notifica Core API (para auto-role e registro)
        try {
            const { data } = await coreApi.post('/internal/members/join', {
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
                        log.info(`Auto-role "${role.name}" aplicado em ${member.user.tag}`);
                    }
                }
            }

            // Posta log no canal configurado
            if (data?.logChannelId) {
                const logChannel = guild.channels.cache.get(data.logChannelId) as TextChannel;
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setColor(0x57F287)
                        .setTitle('📥 Novo Membro')
                        .setThumbnail(member.user.avatarURL())
                        .addFields(
                            { name: '👤 Usuário', value: `<@${member.id}> — ${member.user.username}`, inline: false },
                            { name: '🆔 ID', value: member.id, inline: true },
                            { name: '📅 Conta criada', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                        )
                        .setFooter({ text: `Total de membros: ${guild.memberCount}` })
                        .setTimestamp();

                    await logChannel.send({ embeds: [embed] });
                }
            }
        } catch (err: any) {
            log.warn(`Erro ao processar entrada de ${member.user.tag}: ${err.message}`);
        }
    }
};
