import { Client, TextChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { BaseModule } from '../BaseModule';
import { log } from '../../utils/logger';
import coreApi from '../../utils/api-client';

/**
 * Módulo de Verificação Automática
 * Escuta o evento guildMemberAdd e envia o painel de verificação no canal configurado.
 * Suporta dois modos:
 *   - verification: botão direto que atribui o cargo
 *   - advanced_verification: link externo (URL) + botão "Já verifiquei" que atribui o cargo
 */
const verification_module: BaseModule = {
    id: 'auto_verification',
    name: 'Verificação Automática',
    category: 'Security',

    init: (client: Client) => {
        client.on('guildMemberAdd', async (member) => {
            try {
                const { data } = await coreApi.get(`/internal/guilds/${member.guild.id}/modules`);
                const modules: any[] = data.modules || [];
                const lang: string = data.language || 'pt-BR';

                // Prioridade: advanced_verification > verification
                const advModule = modules.find((m: any) => m.key === 'advanced_verification');
                const simpleModule = modules.find((m: any) => m.key === 'verification');
                const activeModule = advModule || simpleModule;

                if (!activeModule) return;

                const config = activeModule.config || {};
                const channelId = config.channelId || config.verificationChannelId;
                if (!channelId) return;

                const channel = member.guild.channels.cache.get(channelId) as TextChannel;
                if (!channel) return;

                const isAdvanced = activeModule.key === 'advanced_verification';
                const externalUrl = config.url || config.verificationUrl || '';

                // ── Embed ──────────────────────────────────────────────────────
                const defaultDesc = isAdvanced
                    ? `⚙️ **Sistema de proteção contra ataque de BOTs** *(Robôs)*.\n\n🖐️ Para confirmar que você não é um robô, clique abaixo.`
                    : `Olá <@${member.id}>, clique no botão abaixo para verificar sua identidade e ter acesso ao servidor.`;

                const embed = new EmbedBuilder()
                    .setTitle(config.title || (isAdvanced ? '🔐 Verificação de Segurança' : '✅ Verificação'))
                    .setDescription(config.message || defaultDesc)
                    .setColor(isAdvanced ? 0x5865F2 : 0x57F287)
                    .setFooter({ text: member.guild.name });

                // ── Botões ─────────────────────────────────────────────────────
                const components: ActionRowBuilder<ButtonBuilder>[] = [];
                const guildId = member.guild.id;

                if (isAdvanced && externalUrl) {
                    // Link para URL externa + botão de confirmação
                    const linkLabel = lang === 'pt-BR' ? '🤖 Verificar Conta' : '🤖 Verify Account';
                    const confirmLabel = lang === 'pt-BR' ? '✅ Já verifiquei' : '✅ Already verified';
                    components.push(
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                            new ButtonBuilder().setLabel(linkLabel).setStyle(ButtonStyle.Link).setURL(externalUrl),
                            new ButtonBuilder()
                                .setCustomId(`advanced_verify_confirm_${guildId}`)
                                .setLabel(confirmLabel)
                                .setStyle(ButtonStyle.Success)
                        )
                    );
                } else {
                    // Botão direto: atribui o cargo na hora
                    const btnLabel = lang === 'pt-BR' ? '🤖 Não sou um robô!' : '🤖 I am not a robot!';
                    components.push(
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`verification_verify_${guildId}`)
                                .setLabel(btnLabel)
                                .setStyle(ButtonStyle.Success)
                        )
                    );
                }

                // Tentar enviar por DM primeiro para ser privado
                try {
                    await member.send({ embeds: [embed], components });
                    log.info(`[VERIFICATION] ✅ Painel enviado via DM para ${member.user.tag}`);
                } catch (dmError) {
                    // Se DM falhar (bloqueada), envia no canal
                    const sentMessage = await channel.send({ content: `<@${member.id}>`, embeds: [embed], components });
                    log.info(`[VERIFICATION] ✅ DM bloqueada, painel enviado no canal para ${member.user.tag}`);
                    
                    // Opcional: auto-deletar após 15 minutos se não verificado para manter o canal limpo
                    setTimeout(() => {
                        sentMessage.delete().catch(() => {});
                    }, 15 * 60 * 1000);
                }

            } catch (error: any) {
                log.error(`[VERIFICATION] ❌ Erro ao enviar painel para ${member.user.tag}: ${error.message}`);
            }
        });
    },

    handleAction: async (_action: string, _params: any) => { }
};

export default verification_module;
