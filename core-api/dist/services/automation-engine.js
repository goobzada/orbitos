"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.automationEngine = exports.AutomationEngine = void 0;
const event_bus_1 = require("./event-bus");
const prisma_1 = __importDefault(require("../lib/prisma"));
const driver_manager_1 = require("./drivers/driver-manager");
class AutomationEngine {
    constructor() {
        this.registerHandlers();
    }
    registerHandlers() {
        // Escuta TODOS os eventos do sistema
        event_bus_1.eventBus.on('any', (eventName, payload) => {
            this.handleEvent(eventName, payload);
        });
    }
    async handleEvent(eventName, payload) {
        // Ignorar eventos de log e execução para evitar loops
        if (eventName === 'any' || eventName.startsWith('driver.'))
            return;
        // Se o payload não tiver organizationId, tentamos resolver via server se houver
        let organizationId = payload.organizationId;
        if (!organizationId && payload.server?.organizationId) {
            organizationId = payload.server.organizationId;
        }
        if (!organizationId) {
            // console.warn(`[AUTOMATION] ⚠️ Evento ${eventName} ignorado: organizationId não encontrado.`);
            return;
        }
        try {
            // Buscar automações ativas para este evento e organização
            const automations = await prisma_1.default.automation.findMany({
                where: {
                    organizationId,
                    trigger: eventName,
                    isActive: true
                }
            });
            for (const automation of automations) {
                console.log(`[AUTOMATION] ⚙️ Processando regra: ${automation.name}`);
                const conditionsMatch = this.evaluateConditions(automation.conditions, payload);
                if (conditionsMatch) {
                    const actions = JSON.parse(automation.actions || '[]');
                    for (const action of actions) {
                        try {
                            await driver_manager_1.driverManager.executeAction({
                                driver: action.driver,
                                action: action.type,
                                organizationId,
                                serverId: automation.serverId,
                                data: action.params
                            });
                            // Log de Sucesso
                            await prisma_1.default.automationLog.create({
                                data: {
                                    automationId: automation.id,
                                    organizationId,
                                    triggerEvent: eventName,
                                    status: 'SUCCESS'
                                }
                            });
                        }
                        catch (err) {
                            console.error(`[AUTOMATION] ❌ Erro na ação ${action.type}:`, err.message);
                            await prisma_1.default.automationLog.create({
                                data: {
                                    automationId: automation.id,
                                    organizationId,
                                    triggerEvent: eventName,
                                    status: 'FAILED',
                                    error: err.message
                                }
                            });
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error(`[AUTOMATION] ❌ Erro ao buscar automações:`, error);
        }
    }
    evaluateConditions(conditionsJson, payload) {
        if (!conditionsJson)
            return true;
        try {
            const conditions = JSON.parse(conditionsJson);
            if (!Array.isArray(conditions))
                return true;
            // Suporte básico a AND (todos devem bater)
            return conditions.every(cond => {
                const actualValue = this.getValueByPath(payload, cond.field);
                switch (cond.op) {
                    case 'eq': return actualValue === cond.value;
                    case 'ne': return actualValue !== cond.value;
                    case 'contains': return String(actualValue).includes(cond.value);
                    default: return true;
                }
            });
        }
        catch {
            return true;
        }
    }
    getValueByPath(obj, path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }
}
exports.AutomationEngine = AutomationEngine;
exports.automationEngine = new AutomationEngine();
