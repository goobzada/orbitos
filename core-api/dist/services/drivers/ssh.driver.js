"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sshDriver = exports.SshDriver = void 0;
const event_bus_1 = require("../event-bus");
// 🚀 SSH Driver V2
// Gerencia execução de comandos em servidores remotos via Orbit Agent SDK.
// Utiliza comunicação bidirecional (Promise-based) com timeout e fallback.
class SshDriver {
    async execute(payload) {
        const { serverId, action, params } = payload;
        const { command } = params;
        console.log(`[DRIVER SSH] 🛡️ Executando: ${action} em Server ${serverId}. Comando: ${command}`);
        try {
            const { communityWSServer } = await Promise.resolve().then(() => __importStar(require('../ws-server')));
            // Verificar se o Agent está online para este servidor
            const agentOnline = communityWSServer.isAgentConnected(serverId);
            if (!agentOnline) {
                // Fallback: broadcast genérico (para o Bot Engine que pode repassar)
                console.warn(`[DRIVER SSH] ⚠️  Nenhum Agent Orbit conectado para Server ${serverId}. Usando broadcast fallback.`);
                communityWSServer.broadcastToTarget(serverId, 'SSH_ACTION', {
                    serverId,
                    action: 'EXECUTE_REMOTE',
                    params: { command }
                });
                event_bus_1.eventBus.emitEvent('driver.execution.dispatched', { driver: 'ssh', action, payload, mode: 'broadcast-fallback' });
                return { status: 'DISPATCHED', output: 'Comando enviado via broadcast. Aguarde confirmação do agente.' };
            }
            // ✅ Agent online: aguarda resposta bidirecional (até 30s)
            console.log(`[DRIVER SSH] 📡 Agent online! Enviando e aguardando resposta...`);
            const response = await communityWSServer.sendAndAwaitResponse(serverId, 'SSH_ACTION', {
                serverId,
                action: 'EXECUTE_REMOTE',
                params: { command }
            }, 30000);
            if (response.status === 'SUCCESS') {
                console.log(`[DRIVER SSH] ✅ Resposta do Agent: ${response.output?.slice(0, 200) || '(sem output)'}`);
                event_bus_1.eventBus.emitEvent('driver.execution.success', {
                    driver: 'ssh',
                    action,
                    output: response.output,
                    payload
                });
                return { status: 'SUCCESS', output: response.output };
            }
            else {
                console.error(`[DRIVER SSH] ❌ Agent reportou falha (${response.status}): ${response.error}`);
                event_bus_1.eventBus.emitEvent('driver.execution.failed', {
                    driver: 'ssh',
                    action,
                    error: response.error,
                    payload
                });
                return { status: response.status, error: response.error };
            }
        }
        catch (error) {
            console.error(`[DRIVER SSH] ❌ Erro crítico: ${error.message}`);
            event_bus_1.eventBus.emitEvent('driver.execution.failed', {
                driver: 'ssh',
                action,
                error: error.message
            });
            return { status: 'ERROR', error: error.message };
        }
    }
}
exports.SshDriver = SshDriver;
exports.sshDriver = new SshDriver();
