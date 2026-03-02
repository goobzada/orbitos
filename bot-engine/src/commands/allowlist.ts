import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { moduleLoader } from '../index';

export default {
    data: new SlashCommandBuilder()
        .setName('allowlist')
        .setDescription('📝 Iniciar ou checar a Allowlist do servidor'),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId) {
            return interaction.reply({ content: 'Este comando só pode ser usado em um servidor.', ephemeral: true });
        }

        try {
            const config = await moduleLoader.getGuildModuleConfig(interaction.guildId, 'whitelist');

            if (!config || !config.questions || config.questions.length === 0) {
                return interaction.reply({
                    content: 'Nenhum formulário de whitelist (allowlist) foi configurado para este servidor, ou ele não está ativo no painel.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(`📝 Formulário de Whitelist`)
                .setDescription('Para prosseguir, clique no botão abaixo e inicie as suas definições no formulário de allowlist. Leia com atenção!')
                .setColor(0x57F287);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`whitelist_start_simple`)
                        .setLabel('Iniciar Whitelist')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('📝')
                );

            return interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: true
            });

        } catch (error: unknown) {
            const err = error as Error;
            console.error('[AllowlistCommand] Error:', err.message);
            return interaction.reply({
                content: 'Houve um erro interno ao buscar a whitelist. Tente novamente mais tarde.',
                ephemeral: true
            });
        }
    }
};
