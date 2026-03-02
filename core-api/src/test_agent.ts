import { communityWSServer } from './services/ws-server';
import http from 'http';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

// Simulating a server upgrade and initialization
const server = http.createServer();
communityWSServer.init(server);

// Aguarda os agentes conectarem
console.log('Aguardando 5 segundos para os agentes estabilizarem...');
setTimeout(async () => {
    const agents = communityWSServer.getConnectedAgents();
    console.log('Agentes Conectados:', agents);

    if (agents.length === 0) {
        console.log('❌ Nenhum agente encontrado.');
        process.exit(1);
    }

    const targetServerId = '821810593236516925';
    console.log(`🔌 Enviando comando core-api -> Agent (${targetServerId})...`);

    try {
        const response = await communityWSServer.sendAndAwaitResponse(
            targetServerId,
            'SSH_ACTION',
            {
                serverId: targetServerId,
                action: 'TEST_ECHO',
                params: {
                    command: 'echo "OrbitOS Agent V2 is alive! Time: " && date'
                }
            },
            10000
        );

        console.log('✅ Resposta Recebida:');
        console.log(JSON.stringify(response, null, 2));
    } catch (err: any) {
        console.error('❌ Falha na comunicação:', err.message);
    }

    process.exit(0);
}, 5000);

server.listen(4005); // Port differ from actual running one
