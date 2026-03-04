/**
 * ecosystem.agents.config.cjs
 * 
 * O Orbit Agent Supervisor V3 é um processo único que descobre
 * AUTOMATICAMENTE todos os servidores ativos via API.
 * 
 * Não é necessário editar este arquivo ao adicionar novos servidores.
 * O supervisor detecta novos servidores a cada POLL_INTERVAL_MS.
 * 
 * Uso na VPS:
 *   pm2 start ecosystem.agents.config.cjs
 *   pm2 save
 */

module.exports = {
    apps: [
        {
            name: 'orbitos-agent-supervisor',
            script: 'dist/index.js',
            cwd: '/home/orbit/orbitos/orbit-agent',
            env: {
                NODE_ENV: 'production',
                AGENT_TOKEN: process.env.AGENT_TOKEN || 'bot-ws-token-v2-change-in-production',
                CORE_API_WS_URL: process.env.CORE_API_WS_URL || 'ws://127.0.0.1:4000/ws/agent',
                CORE_API_HTTP_URL: process.env.CORE_API_HTTP_URL || 'http://127.0.0.1:4000',
                POLL_INTERVAL_MS: '30000', // descobre novos servidores a cada 30s
            },
        },
    ],
};
