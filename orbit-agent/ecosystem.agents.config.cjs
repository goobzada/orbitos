/**
 * ecosystem.agents.config.cjs
 *
 * Orbit Agent Supervisor V3 — processo único que descobre TODOS os servidores
 * automaticamente via API e cria conexões WS para cada um.
 *
 * Uso na VPS:
 *   pm2 start ecosystem.agents.config.cjs
 *   pm2 save
 *
 * ⚠️  IMPORTANTE: O PM2 carrega variáveis do env_file abaixo.
 *     Se você mudou o .env, rode: pm2 restart orbitos-agent-supervisor --update-env
 */

const path = require('path');

module.exports = {
    apps: [
        {
            name: 'orbitos-agent-supervisor',
            script: 'dist/index.js',
            cwd: '/home/orbit/orbitos/orbit-agent',
            // env_file garante que PM2 carrega o .env ANTES de iniciar o processo
            env_file: '/home/orbit/orbitos/orbit-agent/.env',
            watch: false,
            autorestart: true,
            max_restarts: 10,
            restart_delay: 3000,
            env: {
                NODE_ENV: 'production',
                // Valores padrão — SERÃO sobrescritos pelo env_file se existirem lá
                CORE_API_WS_URL: 'ws://127.0.0.1:4000/ws/agent',
                CORE_API_HTTP_URL: 'http://127.0.0.1:4000',
                POLL_INTERVAL_MS: '30000',
            },
        },
    ],
};
