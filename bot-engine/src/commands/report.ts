import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    TextChannel,
} from 'discord.js';
import { log } from '../utils/logger';
import coreApi from '../utils/api-client';

export default {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('🚨 Reportar um membro ou situação para a staff')
        .addUserOption(o => o.setName('membro').setDescription('Membro a ser reportado').setRequired(true))
        .addStringOption(o => o.setName('motivo').setDescription('Descreva o motivo da denúncia').setRequired(true))
        .addStringOption(o => o.setName('evidencia').setDescription('Link de evidência (imagem, mensagem, etc)').setRequired(false)),

    async execute(interaction: ChatInputCommandInteraction) {
        const target = interaction.options.getUser('membro', true);
        const motivo = interaction.options.getString('motivo', true);
        const evidencia = interaction.options.getString('evidencia') || null;

        const autoDelete = (msg: string) =>
            interaction.reply({ content: msg, ephemeral: true, fetchReply: true })
                .then(r => setTimeout(() => interaction.deleteReply().catch(() => {}), 10000));

        if (target.id === interaction.user.id) {
            return autoDelete('❌ Você não pode reportar a si mesmo.');
        }
        if (target.bot) {
            return autoDelete('❌ Você não pode reportar um bot.');
        }

        // Buscar configuração do módulo
        let reportChannelId: string | null = null;
        let anonymous = false;
        try {
            const { data } = await coreApi.get(`/internal/guilds/${interaction.guildId}/modules`);
            const mod = (data.modules || []).find((m: any) => m.key === 'report');
            reportChannelId = mod?.config?.channelId || null;
            anonymous = mod?.config?.anonymous || false;
        } catch (err: any) {
            log.warn('[REPORT] Erro ao buscar config do módulo: ' + err.message);
        }

        if (!reportChannelId) {
            return autoDelete('❌ O canal de denúncias não está configurado. Acesse o Dashboard → Support → Denúncias → configure o canal.');
        }

        // Montar o embed da denúncia
        const reportEmbed = new EmbedBuilder()
            .setColor(0xFF4040)
            .setTitle('🚨 Nova Denúncia Recebida')
            .addFields(
                { name: '👤 Reportado', value: `<@${target.id}> (${target.username})`, inline: true },
                { name: anonymous ? '🕵️ Denunciante' : '👮 Denunciante', value: anonymous ? '*(anônimo)*' : `<@${interaction.user.id}> (${interaction.user.username})`, inline: true },
                { name: '📋 Motivo', value: motivo },
            )
            .setThumbnail(target.displayAvatarURL({ size: 128 }))
            .setFooter({ text: `Servidor: ${interaction.guild?.name} • Canal: #${(interaction.channel as any)?.name || 'desconhecido'}` })
            .setTimestamp();

        if (evidencia) {
            reportEmbed.addFields({ name: '🔗 Evidência', value: evidencia });
        }

        // Enviar no canal de denúncias
        try {
            const reportCh = interaction.guild!.channels.cache.get(reportChannelId)
                || await interaction.guild!.channels.fetch(reportChannelId).catch(() => null);

            if (!reportCh || !('send' in reportCh)) {
                return autoDelete('❌ Não consegui acessar o canal de denúncias. Verifique as permissões do bot.');
            }

            await (reportCh as TextChannel).send({ embeds: [reportEmbed] });
            log.event(`[REPORT] ${interaction.user.tag} reportou ${target.tag} em ${interaction.guild?.name}`);
        } catch (err: any) {
            log.error('[REPORT] Erro ao enviar denúncia: ' + err.message);
            return autoDelete('❌ Erro ao enviar a denúncia. Tente novamente.');
        }

        return autoDelete('✅ Sua denúncia foi enviada com sucesso para a equipe. Obrigado por ajudar a manter a comunidade segura!');
    }
};
