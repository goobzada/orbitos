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

        // Montar o embed da denúncia (Para a Staff)
        const reportEmbed = new EmbedBuilder()
            .setColor(0xFF4040)
            .setTitle('🚨 Denúncia de Membro — Central de Segurança')
            .setThumbnail(target.displayAvatarURL({ size: 128 }))
            .addFields(
                { name: '👤 Indivíduo Reportado', value: `<@${target.id}>\nID: \`${target.id}\``, inline: true },
                { name: anonymous ? '🕵️ Autor da Denúncia' : '👮 Autor da Denúncia', value: anonymous ? '*(Mantido em Sigilo)*' : `<@${interaction.user.id}>\nID: \`${interaction.user.id}\``, inline: true },
                { name: '📋 Detalhamento do Motivo', value: `\`\`\`${motivo}\`\`\`` },
            )
            .setFooter({ text: `Protocolo OrbitUp • Local: #${(interaction.channel as any)?.name || 'desconhecido'}` })
            .setTimestamp();

        if (evidencia) {
            reportEmbed.addFields({ name: '🔗 Evidências Anexadas', value: evidencia });
        }

        // Enviar no canal de denúncias (Secret Staff Channel)
        try {
            const reportCh = interaction.guild!.channels.cache.get(reportChannelId)
                || await interaction.guild!.channels.fetch(reportChannelId).catch(() => null);

            if (!reportCh || !('send' in reportCh)) {
                return interaction.reply({ 
                    content: '❌ **Erro de Configuração:** O canal de denúncias não foi encontrado ou está inacessível para a staff.', 
                    ephemeral: true 
                });
            }

            await (reportCh as TextChannel).send({ embeds: [reportEmbed] });
            
            // Sucesso Privado (Apenas o usuário vê)
            const successEmbed = new EmbedBuilder()
                .setColor(0x2ECC71)
                .setTitle('✅ Denúncia Enviada com Sucesso')
                .setDescription(
                    'Sua denúncia foi processada e enviada diretamente para a nossa equipe de moderação.\n\n' +
                    '🛡️ **Privacidade Garantida**: Esta mensagem é visível apenas para você. Ninguém mais no canal sabe que você realizou esta denúncia.'
                )
                .setFooter({ text: 'OrbitUp • Mantendo a comunidade segura' });

            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
            
            log.event(`[REPORT] ${interaction.user.tag} reportou ${target.tag} em ${interaction.guild?.name}`);

        } catch (err: any) {
            log.error('[REPORT] Erro ao enviar denúncia: ' + err.message);
            return interaction.reply({ content: '❌ Ocorreu uma falha ao processar sua denúncia. Tente novamente mais tarde.', ephemeral: true });
        }
    }
};
