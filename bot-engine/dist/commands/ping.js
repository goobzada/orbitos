"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const api_client_1 = __importDefault(require("../utils/api-client"));
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('ping')
        .setDescription('🏓 Mostra a latência do bot e o status da Core API'),
    async execute(interaction) {
        await interaction.deferReply();
        const start = Date.now();
        let apiStatus = '✅ Online';
        let apiLatency = 0;
        let apiColor = 0x57F287; // verde
        try {
            const apiStart = Date.now();
            await api_client_1.default.get('/');
            apiLatency = Date.now() - apiStart;
        }
        catch {
            apiStatus = '❌ Offline';
            apiColor = 0xED4245; // vermelho
        }
        const botLatency = Date.now() - start;
        const wsLatency = interaction.client.ws.ping;
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(apiColor)
            .setTitle('🏓 Pong!')
            .addFields({ name: '🤖 Bot Latência', value: `\`${botLatency}ms\``, inline: true }, { name: '📡 WebSocket', value: `\`${wsLatency}ms\``, inline: true }, { name: '🧠 Core API', value: `${apiStatus} \`${apiLatency}ms\``, inline: true })
            .setFooter({ text: 'SaaSBot • Status do Sistema' })
            .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
    }
};
