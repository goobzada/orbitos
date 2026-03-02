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
exports.rconDriver = exports.RconDriver = void 0;
const event_bus_1 = require("../event-bus");
// 🎮 RCON Driver V2
// Executa comandos de jogo em servidores remotos (FiveM, Minecraft, Rust, etc.)
// via Orbit Agent SDK com comunicação bidirecional.
class RconDriver {
    async execute(payload) {
        const { serverId, action, params } = payload;
        const { command, host, port, password } = params;
        console.log(`[DRIVER RCON] 🎮 Executando: ${action} em ${host}:${port} — Comando: ${command}`);
        try {
            const { communityWSServer } = await Promise.resolve().then(() => __importStar(require('../ws-server')));
            const agentOnline = communityWSServer.isAgentConnected(serverId);
            if (!agentOnline) {
                // Fallback: broadcast genérico para o Bot Engine
                console.warn(`[DRIVER RCON] ⚠️  Sem Agent local para Server ${serverId}. Usando broadcast fallback para Bot Engine.`);
                communityWSServer.broadcastToTarget(serverId, 'RCON_ACTION', {
                    serverId,
                    host,
                    port,
                    password,
                    action: 'EXECUTE_COMMAND',
                    params: { command }
                });
                event_bus_1.eventBus.emitEvent('driver.execution.dispatched', { driver: 'rcon', action, payload, mode: 'broadcast-fallback' });
                return { status: 'DISPATCHED', output: 'Comando RCON enviado via broadcast. Resposta assíncrona.' };
            }
            // ✅ Agent online — aguarda resposta em até 15s (RCON é mais rápido que SSH)
            const response = await communityWSServer.sendAndAwaitResponse(serverId, 'RCON_ACTION', {
                serverId,
                host,
                port,
                password,
                action: 'EXECUTE_COMMAND',
                params: { command }
            }, 15000);
            if (response.status === 'SUCCESS') {
                console.log(`[DRIVER RCON] ✅ Resposta RCON: ${response.output?.slice(0, 200) || '(sem output)'}`);
                event_bus_1.eventBus.emitEvent('driver.execution.success', {
                    driver: 'rcon', action, output: response.output, payload
                });
                return { status: 'SUCCESS', output: response.output };
            }
            else {
                console.error(`[DRIVER RCON] ❌ Agent reportou ${response.status}: ${response.error}`);
                event_bus_1.eventBus.emitEvent('driver.execution.failed', {
                    driver: 'rcon', action, error: response.error, payload
                });
                return { status: response.status, error: response.error };
            }
        }
        catch (error) {
            console.error(`[DRIVER RCON] ❌ Erro crítico: ${error.message}`);
            event_bus_1.eventBus.emitEvent('driver.execution.failed', {
                driver: 'rcon', action, error: error.message
            });
            return { status: 'ERROR', error: error.message };
        }
    }
}
exports.RconDriver = RconDriver;
exports.rconDriver = new RconDriver();
