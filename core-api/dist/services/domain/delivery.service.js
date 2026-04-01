"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const driver_manager_1 = require("../drivers/driver-manager");
class DeliveryService {
    /**
     * Entrega todos os itens de um pedido pago.
     */
    static async deliverOrder(orderId) {
        const order = await prisma_1.default.storeOrder.findUnique({
            where: { id: orderId },
            include: {
                items: { include: { product: true } },
                organization: true
            }
        });
        if (!order || order.status !== 'PAID')
            return;
        console.log(`[DELIVERY] 📦 Processando entrega para o Pedido: ${orderId}`);
        for (const item of order.items) {
            try {
                await this.deliverItem(order, item);
                // Marcar como entregue (sem sobrescrever o log detalhado feito no deliverItem)
                await prisma_1.default.storeOrderItem.update({
                    where: { id: item.id },
                    data: { deliveryStatus: 'DELIVERED' }
                });
            }
            catch (err) {
                console.error(`[DELIVERY] ❌ Falha ao entregar item ${item.id}:`, err.message);
                await prisma_1.default.storeOrderItem.update({
                    where: { id: item.id },
                    data: { deliveryStatus: 'FAILED', deliveryLog: err.message }
                });
            }
        }
    }
    static async deliverItem(order, item) {
        const product = item.product;
        const config = product.deliveryConfig ? JSON.parse(product.deliveryConfig) : {};
        console.log(`[DELIVERY] 🚀 Entregando item: ${product.name} (${product.deliveryType})`);
        let result = null;
        switch (product.deliveryType) {
            case 'DISCORD_ROLE':
                if (!config.roleId || !order.externalCustomerId) {
                    throw new Error('Configuração de Discord Role incompleta.');
                }
                const discordServerId = config.serverId || order.organization.servers?.[0]?.id;
                if (!discordServerId) {
                    throw new Error('Discord Role delivery requer um servidor configurado no produto ou na organização.');
                }
                result = await driver_manager_1.driverManager.executeAction({
                    driver: 'discord',
                    action: 'ADD_ROLE',
                    organizationId: order.organizationId,
                    serverId: discordServerId,
                    data: {
                        userId: order.externalCustomerId,
                        roleId: config.roleId
                    }
                });
                break;
            case 'MINECRAFT_COMMAND':
            case 'RCON_COMMAND':
                if (!config.command) {
                    throw new Error('Comando RCON/MC não configurado.');
                }
                const rconCmd = config.command.replace('{player}', order.externalCustomerId || 'unknown');
                result = await driver_manager_1.driverManager.executeAction({
                    driver: 'rcon',
                    action: 'EXECUTE_COMMAND',
                    organizationId: order.organizationId,
                    serverId: config.serverId,
                    data: {
                        command: rconCmd,
                        host: config.host,
                        port: config.port,
                        password: config.password
                    }
                });
                break;
            case 'FIVEM_EVENT':
                if (!config.eventName) {
                    throw new Error('Evento FiveM não configurado.');
                }
                result = await driver_manager_1.driverManager.executeAction({
                    driver: 'fivem',
                    action: 'EMIT_EVENT',
                    organizationId: order.organizationId,
                    serverId: config.serverId,
                    data: {
                        eventName: config.eventName,
                        data: {
                            userId: order.externalCustomerId,
                            items: config.items || [],
                            metadata: order.metadata
                        }
                    }
                });
                break;
            case 'SSH_COMMAND':
            case 'AGENT_COMMAND':
                if (!config.command) {
                    throw new Error('Comando AGENT não configurado.');
                }
                const sshCmd = config.command.replace('{user}', order.externalCustomerId || 'unknown');
                result = await driver_manager_1.driverManager.executeAction({
                    driver: 'ssh',
                    action: 'EXECUTE_REMOTE',
                    organizationId: order.organizationId,
                    serverId: config.serverId,
                    data: {
                        command: sshCmd,
                        host: config.host,
                        port: config.port || 22,
                        username: config.username,
                        password: config.password
                    }
                });
                break;
            case 'MANUAL':
                console.log(`[DELIVERY] ℹ️ Entrega manual necessária para o item: ${product.name}`);
                return; // Não precisa atualizar DB pois é manual
            default:
                console.warn(`[DELIVERY] ⚠️ Tipo de entrega desconhecido: ${product.deliveryType}`);
                throw new Error(`Tipo de entrega desconhecido: ${product.deliveryType}`);
        }
        // Se chegamos aqui, temos um result dos drivers V2
        if (result && result.status !== 'SUCCESS' && result.status !== 'DISPATCHED') {
            throw new Error(`Driver reportou falha: ${result.error || result.status}`);
        }
        // Salvar log de sucesso detalhado no item do pedido
        await prisma_1.default.storeOrderItem.update({
            where: { id: item.id },
            data: {
                deliveryLog: result?.output
                    ? `[AGENT OUTPUT]: ${result.output.slice(0, 200)}`
                    : `Entrega realizada via driver: ${product.deliveryType}`
            }
        });
    }
}
exports.DeliveryService = DeliveryService;
