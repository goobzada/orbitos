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
exports.minecraftDriver = exports.MinecraftDriver = void 0;
const event_bus_1 = require("../event-bus");
class MinecraftDriver {
    async execute(payload) {
        const { serverId, action, params } = payload;
        const command = params.command;
        console.log(`[DRIVER MINECRAFT] ⛏️ Executando: ${action} no servidor ${serverId}. Comando: ${command}`);
        try {
            const { communityWSServer } = await Promise.resolve().then(() => __importStar(require('../ws-server')));
            // Broadcast para o plugin bridge no servidor Minecraft
            communityWSServer.broadcast('MINECRAFT_ACTION', {
                serverId,
                action: 'CONSOLE_COMMAND',
                params: {
                    command: command
                }
            });
            console.log(`[DRIVER MINECRAFT] ✅ Comando enviado via WebSocket: ${command}`);
            event_bus_1.eventBus.emitEvent('driver.execution.success', {
                driver: 'minecraft',
                action,
                payload
            });
        }
        catch (error) {
            console.error(`[DRIVER MINECRAFT] ❌ Erro ao executar: ${error.message}`);
            event_bus_1.eventBus.emitEvent('driver.execution.failed', {
                driver: 'minecraft',
                action,
                error: error.message
            });
        }
    }
}
exports.MinecraftDriver = MinecraftDriver;
exports.minecraftDriver = new MinecraftDriver();
