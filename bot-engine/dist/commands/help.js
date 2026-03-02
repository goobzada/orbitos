"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const commandList = [
    { name: '/setup', desc: 'Configura o painel de tickets no canal atual', perm: 'Administrador' },
    { name: '/sync', desc: 'Re-sincroniza configs do servidor com o painel', perm: 'Administrador' },
    { name: '/ping', desc: 'Mostra latência do bot e status da Core API', perm: 'Todos' },
    { name: '/help', desc: 'Lista todos os comandos disponíveis', perm: 'Todos' },
    { name: '/warn', desc: 'Adverte um membro com motivo registrado', perm: 'Staff' },
    { name: '/mute', desc: 'Silencia um membro por tempo determinado', perm: 'Staff' },
    { name: '/ban', desc: 'Bane um membro do servidor', perm: 'Moderador' },
    { name: '/kick', desc: 'Expulsa um membro do servidor', perm: 'Moderador' },
    { name: '/unban', desc: 'Remove banimento de um usuário', perm: 'Moderador' },
];
exports.default = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('help')
        .setDescription('📚 Lista todos os comandos disponíveis do SaaSBot'),
    async execute(interaction) {
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('📚 Comandos do SaaSBot')
            .setDescription('Todos os comandos disponíveis neste servidor.')
            .addFields({
            name: '⚙️ Setup & Configuração',
            value: commandList
                .filter(c => c.perm === 'Administrador')
                .map(c => `\`${c.name}\` — ${c.desc}`)
                .join('\n'),
        }, {
            name: '🛡️ Moderação',
            value: commandList
                .filter(c => c.perm === 'Staff' || c.perm === 'Moderador')
                .map(c => `\`${c.name}\` — ${c.desc} *(${c.perm})*`)
                .join('\n'),
        }, {
            name: '🔧 Utilidade',
            value: commandList
                .filter(c => c.perm === 'Todos')
                .map(c => `\`${c.name}\` — ${c.desc}`)
                .join('\n'),
        })
            .setFooter({ text: 'SaaSBot • Plataforma SaaS para Discord' })
            .setTimestamp();
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
