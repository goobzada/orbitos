import { eventBus } from './event-bus';
import prisma from '../lib/prisma';
import { driverManager } from './drivers/driver-manager';

export class AutomationEngine {
    constructor() {
        this.registerHandlers();
    }

    private registerHandlers() {
        // Escuta TODOS os eventos do sistema
        eventBus.on('any', (eventName, payload) => {
            this.handleEvent(eventName, payload);
        });
    }

    async handleEvent(eventName: string, payload: any) {
        // Ignorar eventos de log e execução para evitar loops
        if (eventName === 'any' || eventName.startsWith('driver.')) return;

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
            const automations = await prisma.automation.findMany({
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
                            await driverManager.executeAction({
                                driver: action.driver,
                                action: action.type,
                                organizationId,
                                serverId: automation.serverId,
                                data: action.params
                            });

                            // Log de Sucesso
                            await prisma.automationLog.create({
                                data: {
                                    automationId: automation.id,
                                    organizationId,
                                    triggerEvent: eventName,
                                    status: 'SUCCESS'
                                }
                            });
                        } catch (err: any) {
                            console.error(`[AUTOMATION] ❌ Erro na ação ${action.type}:`, err.message);
                            await prisma.automationLog.create({
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
        } catch (error) {
            console.error(`[AUTOMATION] ❌ Erro ao buscar automações:`, error);
        }
    }

    private evaluateConditions(conditionsJson: string | null, payload: any): boolean {
        if (!conditionsJson) return true;

        try {
            const conditions = JSON.parse(conditionsJson);
            if (!Array.isArray(conditions)) return true;

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
        } catch {
            return true;
        }
    }

    private getValueByPath(obj: any, path: string) {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }
}

export const automationEngine = new AutomationEngine();

