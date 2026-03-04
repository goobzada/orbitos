/**
 * ecosystem.agents.config.cjs
 * 
 * Configuração PM2 para os Orbit Agents.
 * Cada app = 1 servidor Discord conectado.
 * 
 * Regras de uso:
 *   pm2 start ecosystem.agents.config.cjs
 *   pm2 restart ecosystem.agents.config.cjs --update-env
 *   pm2 save
 * 
 * Para adicionar um novo servidor:
 *   1. Adicionar um novo objeto no array 'apps' abaixo
 *   2. Definir SERVER_ID com o discordGuildId do servidor
 *   3. Rodar: pm2 restart ecosystem.agents.config.cjs --update-env && pm2 save
 */

const AGENT_TOKEN = process.env.AGENT_TOKEN || 'bot-ws-token-v2-change-in-production';
const WS_URL = process.env.CORE_API_WS_URL || 'ws://127.0.0.1:4000/ws/agent';
const CWD = '/home/orbit/orbitos/orbit-agent';

module.exports = {
    apps: [
        // ── Licensas (1406178188199198820) ──────────────────────────────
        {
            name: 'orbitos-agent-licensas',
            script: 'dist/index.js',
            cwd: CWD,
            env: {
                NODE_ENV: 'production',
                SERVER_ID: '1406178188199198820',
                AGENT_TOKEN,
                CORE_API_WS_URL: WS_URL,
            },
        },

        // ── Enterprise Node (1045310611254427698) ───────────────────────
        {
            name: 'orbitos-agent-enterprise',
            script: 'dist/index.js',
            cwd: CWD,
            env: {
                NODE_ENV: 'production',
                SERVER_ID: '1045310611254427698',
                AGENT_TOKEN,
                CORE_API_WS_URL: WS_URL,
            },
        },

        // ── goobzada (821810593236516925) ───────────────────────────────
        {
            name: 'orbitos-agent-goobzada',
            script: 'dist/index.js',
            cwd: CWD,
            env: {
                NODE_ENV: 'production',
                SERVER_ID: '821810593236516925',
                AGENT_TOKEN,
                CORE_API_WS_URL: WS_URL,
            },
        },
    ],
};
