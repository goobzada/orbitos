"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_server_1 = require("./services/ws-server");
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '../.env' });
// Simulating a server upgrade and initialization
const server = http_1.default.createServer();
ws_server_1.communityWSServer.init(server);
// Aguarda os agentes conectarem
console.log('Aguardando 5 segundos para os agentes estabilizarem...');
setTimeout(async () => {
    const agents = ws_server_1.communityWSServer.getConnectedAgents();
    console.log('Agentes Conectados:', agents);
    if (agents.length === 0) {
        console.log('❌ Nenhum agente encontrado.');
        process.exit(1);
    }
    const targetServerId = '821810593236516925';
    console.log(`🔌 Enviando comando core-api -> Agent (${targetServerId})...`);
    try {
        const response = await ws_server_1.communityWSServer.sendAndAwaitResponse(targetServerId, 'SSH_ACTION', {
            serverId: targetServerId,
            action: 'TEST_ECHO',
            params: {
                command: 'echo "OrbitOS Agent V2 is alive! Time: " && date'
            }
        }, 10000);
        console.log('✅ Resposta Recebida:');
        console.log(JSON.stringify(response, null, 2));
    }
    catch (err) {
        console.error('❌ Falha na comunicação:', err.message);
    }
    process.exit(0);
}, 5000);
server.listen(4005); // Port differ from actual running one
