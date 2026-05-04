import { Client, TextChannel, EmbedBuilder } from 'discord.js';
import { BaseModule } from '../BaseModule';
import { log } from '../../utils/logger';
import coreApi from '../../utils/api-client';

const welcome_message: BaseModule = {
    id: 'welcome_message',
    name: 'Mensagem de Boas-vindas',
    category: 'Onboarding',

    init: (client: Client) => {
        client.on('guildMemberAdd', async (member) => {
            try {
                // 1. Busca quais módulos estão ativos para esse servidor
                const { data } = await coreApi.get(`/internal/guilds/${member.guild.id}/modules`);

                // 2. Verifica se este módulo específico está ativo
                const moduleInfo = data.modules.find((m: any) => m.key === 'welcome_message');
                if (!moduleInfo) return;

                const config = moduleInfo.config || {};
                const channelId = config.channelId;
                if (!channelId) return;

                const channel = member.guild.channels.cache.get(channelId) as TextChannel;
                if (!channel) return;

                const communityName = config.communityName || 'Comunidade';
                const defaultTitle = `✨ Bem-vindo(a) à nossa ${communityName}!`;
                
                const defaultDesc = 
                    `Olá {user}, ficamos muito felizes em ter você conosco no **{guild}**!\n\n` +
                    `» 📜 **Regras:** Não deixe de conferir nossas diretrizes.\n` +
                    `» 👥 **Membros:** Agora somos **{memberCount}** membros.\n\n` +
                    `Sinta-se em casa e aproveite sua estadia! 🎉`;

                const welcomeEmbed = new EmbedBuilder()
                    .setTitle(config.title || defaultTitle)
                    .setDescription(
                        (config.description || defaultDesc)
                            .replace(/{user}/g, member.user.toString())
                            .replace(/{guild}/g, member.guild.name)
                            .replace(/{community}/g, communityName)
                            .replace(/{memberCount}/g, member.guild.memberCount.toString())
                    )
                    .setColor(config.color || '#5865F2');

                // Lógica de Imagem/Banner/Thumbnail
                if (config.imageUrl) {
                    if (config.imagePosition === 'top') {
                        welcomeEmbed.setThumbnail(config.imageUrl);
                    } else {
                        welcomeEmbed.setImage(config.imageUrl);
                        // Se for banner largo, ainda podemos mostrar o avatar do user como miniatura
                        welcomeEmbed.setThumbnail(member.user.displayAvatarURL({ size: 256 }));
                    }
                } else {
                    // Padrão: mostra apenas avatar do usuário
                    welcomeEmbed.setThumbnail(member.user.displayAvatarURL({ size: 256 }));
                }
                
                const footerText = config.footer || `${member.guild.name} • Experiência Exclusiva`;
                welcomeEmbed.setFooter({ text: footerText, iconURL: member.guild.iconURL() || undefined });

                await channel.send({ content: config.mentionUser ? member.user.toString() : undefined, embeds: [welcomeEmbed] });
                log.info(`[WELCOME] ✉️ Mensagem elegante com imagem enviada para ${member.user.tag}`);

            } catch (error: any) {
                log.error(`[WELCOME] ❌ Erro ao processar boas-vindas para ${member.user.tag}: ${error.message}`);
            }
        });
    },

    handleAction: async (action: string, params: any) => {
        if (action === 'dispatch_manual_welcome') {
            log.info(`Disparando boas vindas manualmente: ${params}`);
        }
    }
};

export default welcome_message;
