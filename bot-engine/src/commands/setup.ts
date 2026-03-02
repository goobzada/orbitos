import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    ChannelType,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    EmbedBuilder,
} from 'discord.js';
import { log } from '../utils/logger';

export default {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('🔧 Configura o painel de tickets no canal atual')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const channelId = interaction.channelId;
        let channel: any = interaction.channel;

        if (!channel) {
            try {
                channel = await interaction.client.channels.fetch(channelId);
            } catch (e: any) {
                console.error(`[SETUP] Erro ao buscar canal ${channelId}:`, e.message);
            }
        }

        // Se ainda for nulo ou não for canal de texto (que suporte send)
        if (!channel || !('send' in channel)) {
            console.warn(`[SETUP] Canal inválido ou sem permissão de envio: ID ${channelId}, Tipo: ${channel?.type}`);
            return interaction.editReply('❌ Não consegui acessar este canal para enviar o painel. Verifique se o bot tem permissão de "Ver Canais" e "Enviar Mensagens" aqui.');
        }

        log.event(`/setup executado por ${interaction.user.tag} em #${(channel as any).name || channelId}`);

        // Embed principal do painel de tickets
        const panelEmbed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🎫 Central de Suporte')
            .setDescription(
                'Precisa de ajuda? Clique no botão abaixo para abrir um ticket com nossa equipe de suporte.\n\n' +
                '**📌 Informações importantes:**\n' +
                '• Descreva seu problema com detalhes\n' +
                '• Nossa equipe responderá o mais breve possível\n' +
                '• Um canal privado será criado exclusivamente para você'
            )
            .setThumbnail(interaction.guild?.iconURL() || null)
            .setFooter({ text: 'SaaSBot • Sistema de Tickets Profissional' })
            .setTimestamp();

        // Botão de abrir ticket
        const openButton = new ButtonBuilder()
            .setCustomId('open_ticket')
            .setLabel('📩 Abrir Ticket')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(openButton);

        try {
            await channel.send({ embeds: [panelEmbed], components: [row] });
            log.success(`Painel de tickets criado em #${(channel as any).name || channelId} pelo ${interaction.user.tag}`);
            return interaction.editReply('✅ Painel de tickets criado com sucesso neste canal!');
        } catch (e: any) {
            console.error(`[SETUP] Erro ao enviar painel para o canal:`, e.message);
            return interaction.editReply('❌ O bot não tem permissão para enviar o painel neste canal. Verifique as permissões de "Enviar Mensagens" e "Inserir Links".');
        }
    }
};
