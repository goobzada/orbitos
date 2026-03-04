import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} from 'discord.js';
import coreApi from '../utils/api-client';
import { getTranslation, MODULE_EMOJIS } from '../utils/translations';

export default {
    data: new SlashCommandBuilder()
        .setName('painel')
        .setDescription('⚙️ Painel de Controle — Envie módulos de automação para este canal')
        .setDescriptionLocalizations({
            'en-US': '⚙️ Control Panel — Send automation modules to this channel',
            'es-ES': '⚙️ Panel de Control — Enviar módulos de automatización a este canal'
        })
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId) return;

        await interaction.deferReply({ ephemeral: true });

        try {
            const { data } = await coreApi.get(`/internal/guilds/${interaction.guildId}/modules`);
            const activeModules: any[] = data.modules || [];
            const plan: string = data.plan || 'FREE';
            const communityType: string = data.communityType || 'general';
            const lang: string = data.language || 'pt-BR';

            const { ui, modules: moduleNames } = getTranslation(lang);

            const planColor: number = plan === 'ENTERPRISE' ? 0xFFAA00 : plan === 'PRO' ? 0x9945FF : 0x5865F2;

            const embed = new EmbedBuilder()
                .setTitle(ui.title)
                .setDescription(
                    activeModules.length === 0
                        ? ui.noModules
                        : ui.selectDesc(interaction.channelId)
                )
                .addFields(
                    { name: ui.guild, value: interaction.guild?.name || 'Unknown', inline: true },
                    { name: ui.plan, value: `\`${plan}\``, inline: true },
                    { name: ui.type, value: `\`${communityType}\``, inline: true },
                    { name: ui.activeModules, value: `\`${activeModules.length}\``, inline: true },
                )
                .setColor(planColor)
                .setFooter({ text: `OrbitOS Dashboard • ${lang}`, iconURL: interaction.client.user?.displayAvatarURL() });

            if (activeModules.length === 0) {
                const dashboardBtn = new ButtonBuilder()
                    .setLabel(ui.openDashboard)
                    .setStyle(ButtonStyle.Link)
                    .setURL(`${process.env.DASHBOARD_URL || 'https://orbitup.io'}/dashboard/automations`)
                    .setEmoji('🚀');

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(dashboardBtn);

                return interaction.editReply({ embeds: [embed], components: [row] });
            }

            const select = new StringSelectMenuBuilder()
                .setCustomId('painel_select_module')
                .setPlaceholder(ui.placeholder)
                .addOptions(
                    activeModules.slice(0, 25).map((m: any) => {
                        const translation = moduleNames[m.key];
                        return {
                            label: translation?.name || m.name || m.key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
                            value: m.key,
                            description: translation?.description || m.description || `Send ${m.key} panel`,
                            emoji: MODULE_EMOJIS[m.key] || MODULE_EMOJIS.default,
                        };
                    })
                );

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

            return interaction.editReply({ embeds: [embed], components: [row] });

        } catch (error: any) {
            console.error('[PainelCmd] ❌ Erro:', error?.response?.data || error?.message);

            const status = error?.response?.status;
            const dashboardUrl = process.env.DASHBOARD_URL || 'https://orbitup.io';

            // Embed de erro amigável
            let errorEmbed: EmbedBuilder;

            if (!error.response) {
                errorEmbed = new EmbedBuilder()
                    .setColor(0xFF4444)
                    .setTitle('⚠️ API Offline')
                    .setDescription('O servidor OrbitOS não está respondendo no momento.\n\nTente novamente em alguns instantes ou verifique o status em [orbitup.io](https://orbitup.io).')
                    .setFooter({ text: 'OrbitOS • status.orbitup.io' });

            } else if (status === 404) {
                errorEmbed = new EmbedBuilder()
                    .setColor(0xFFAA00)
                    .setTitle('🔗 Servidor não vinculado')
                    .setDescription(
                        `Este servidor Discord (**${interaction.guild?.name || interaction.guildId}**) ainda não está associado a nenhuma organização OrbitOS.\n\n` +
                        `**Para vincular este servidor:**\n` +
                        `1️⃣ Acesse o painel em [orbitup.io](${dashboardUrl})\n` +
                        `2️⃣ Vá em **Servidores → Adicionar Servidor**\n` +
                        `3️⃣ Use o Guild ID: \`${interaction.guildId}\`\n\n` +
                        `Após vincular, use \`/painel\` novamente.`
                    )
                    .setFooter({ text: `Guild ID: ${interaction.guildId}` })
                    .setTimestamp();

                const linkBtn = new ButtonBuilder()
                    .setLabel('Vincular Agora')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`${dashboardUrl}/dashboard/servers`)
                    .setEmoji('🔗');

                const row = new ActionRowBuilder<ButtonBuilder>().addComponents(linkBtn);
                return interaction.editReply({ embeds: [errorEmbed], components: [row] });

            } else if (status === 401 || status === 403) {
                errorEmbed = new EmbedBuilder()
                    .setColor(0xFF4444)
                    .setTitle('🔒 Erro de Autenticação')
                    .setDescription('Falha na autenticação interna. Contate o administrador da plataforma.');
            } else {
                errorEmbed = new EmbedBuilder()
                    .setColor(0xFF4444)
                    .setTitle('❌ Erro Inesperado')
                    .setDescription(`Não foi possível carregar a configuração deste servidor.\nCódigo: \`${status || 'UNKNOWN'}\``);
            }

            return interaction.editReply({ embeds: [errorEmbed] });
        }

    }
};
