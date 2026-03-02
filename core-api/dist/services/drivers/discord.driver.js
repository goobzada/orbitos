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
exports.discordDriver = exports.DiscordDriver = void 0;
const event_bus_1 = require("../event-bus");
class DiscordDriver {
    constructor() {
        this.registerHandlers();
    }
    registerHandlers() {
        // Escutar ordens de execução do Discord
        event_bus_1.eventBus.on('driver.discord.execute', this.execute.bind(this));
    }
    async execute(payload) {
        const { serverId, userId, action, params } = payload;
        console.log(`[DRIVER DISCORD] 🚀 Executando: ${action} no servidor ${serverId} para o usuário ${userId}`);
        try {
            // 🧠 Community OS: Enviar via WebSocket para o Bot Engine (Driver Layer)
            const { communityWSServer } = await Promise.resolve().then(() => __importStar(require('../ws-server')));
            communityWSServer.broadcast('DISCORD_ACTION', {
                serverId,
                userId,
                action,
                params
            });
            console.log(`[DRIVER DISCORD] ✅ Ação enviada via WebSocket: ${action}`);
            event_bus_1.eventBus.emitEvent('driver.execution.success', {
                driver: 'discord',
                action,
                payload
            });
        }
        catch (error) {
            console.error(`[DRIVER DISCORD] ❌ Erro ao executar ${action}: ${error.message}`);
            event_bus_1.eventBus.emitEvent('driver.execution.failed', {
                driver: 'discord',
                action,
                error: error.message
            });
        }
    }
}
exports.DiscordDriver = DiscordDriver;
exports.discordDriver = new DiscordDriver();
