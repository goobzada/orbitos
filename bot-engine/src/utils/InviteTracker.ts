import { Client, Collection, Invite, Guild } from 'discord.js';
import { log } from './logger';

export class InviteTracker {
    private static invites = new Collection<string, Collection<string, number>>();

    // Inicializa o cache de convites de um servidor
    static async init(guild: Guild) {
        try {
            const guildInvites = await guild.invites.fetch();
            const inviteCache = new Collection<string, number>();

            guildInvites.forEach(invite => {
                inviteCache.set(invite.code, invite.uses || 0);
            });

            this.invites.set(guild.id, inviteCache);
            // log.info(`[InviteTracker] Cache inicializado para ${guild.name}: ${inviteCache.size} convites.`);
        } catch (error: any) {
            log.error(`[InviteTracker] Erro ao buscar convites de ${guild.name}: ${error.message}`);
        }
    }

    // Detecta qual convite foi usado
    static async findInviter(guild: Guild): Promise<Invite | null> {
        try {
            const cachedInvites = this.invites.get(guild.id);
            const currentInvites = await guild.invites.fetch();

            // Atualiza o cache e encontra o que mudou
            let usedInvite: Invite | null = null;

            for (const [code, invite] of currentInvites) {
                const prevUses = cachedInvites?.get(code) || 0;
                if (invite.uses && invite.uses > prevUses) {
                    usedInvite = invite;
                }
                cachedInvites?.set(code, invite.uses || 0);
            }

            if (usedInvite) {
                return usedInvite;
            }

            return null;
        } catch (error: any) {
            log.error(`[InviteTracker] Erro ao rastrear convite em ${guild.name}: ${error.message}`);
            return null;
        }
    }

    // Remove cache quando o bot sai do servidor
    static removeGuild(guildId: string) {
        this.invites.delete(guildId);
    }
}
