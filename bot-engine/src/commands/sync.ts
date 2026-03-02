import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits
} from 'discord.js';
import coreApi from '../utils/api-client';
import { log } from '../utils/logger';

export default {
    data: new SlashCommandBuilder()
        .setName('sync')
        .setDescription('🔄 Re-sincroniza as configurações do servidor com o painel SaaSBot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild!;

        log.event(`/sync executado por ${interaction.user.tag} em ${guild.name}`);

        try {
            const { data } = await coreApi.post('/internal/guilds', {
                discordGuildId: guild.id,
                name: guild.name,
                icon: guild.iconURL({ size: 256 }),
                memberCount: guild.memberCount,
            });

            const embed = new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('✅ Sincronização Concluída')
                .setDescription(`As configurações do servidor **${guild.name}** foram sincronizadas com sucesso com o painel SaaSBot.`)
                .addFields(
                    { name: '🖥️ Servidor', value: guild.name, inline: true },
                    { name: '📊 Status', value: data?.server?.isActive ? '🟢 Ativo' : '🔴 Inativo', inline: true },
                )
                .setFooter({ text: 'SaaSBot • Configure seu servidor em: localhost:3001/dashboard' })
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        } catch (err: any) {
            const isNotFound = err?.response?.status === 404;

            const embed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle('❌ Servidor não cadastrado')
                .setDescription(
                    isNotFound
                        ? `O servidor **${guild.name}** ainda não está vinculado a nenhuma organização no SaaSBot.\n\n➡️ Acesse o painel e adicione este servidor primeiro: **localhost:3001/dashboard/servers**`
                        : `Erro ao conectar com a Core API: \`${err.message}\``
                )
                .setFooter({ text: 'SaaSBot • Suporte' })
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        }
    }
};
