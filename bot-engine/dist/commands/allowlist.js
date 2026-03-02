"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const index_1 = require("../index");
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('allowlist')
        .setDescription('📝 Iniciar ou checar a Allowlist do servidor'),
    async execute(interaction) {
        if (!interaction.guildId) {
            return interaction.reply({ content: 'Este comando só pode ser usado em um servidor.', ephemeral: true });
        }
        try {
            const config = await index_1.moduleLoader.getGuildModuleConfig(interaction.guildId, 'whitelist');
            if (!config || !config.questions || config.questions.length === 0) {
                return interaction.reply({
                    content: 'Nenhum formulário de whitelist (allowlist) foi configurado para este servidor, ou ele não está ativo no painel.',
                    ephemeral: true
                });
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`📝 Formulário de Whitelist`)
                .setDescription('Para prosseguir, clique no botão abaixo e inicie as suas definições no formulário de allowlist. Leia com atenção!')
                .setColor(0x57F287);
            const row = new discord_js_1.ActionRowBuilder()
                .addComponents(new discord_js_1.ButtonBuilder()
                .setCustomId(`whitelist_start_simple`)
                .setLabel('Iniciar Whitelist')
                .setStyle(discord_js_1.ButtonStyle.Primary)
                .setEmoji('📝'));
            return interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: true
            });
        }
        catch (error) {
            const err = error;
            console.error('[AllowlistCommand] Error:', err.message);
            return interaction.reply({
                content: 'Houve um erro interno ao buscar a whitelist. Tente novamente mais tarde.',
                ephemeral: true
            });
        }
    }
};
