"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerController = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const audit_service_1 = require("../services/domain/audit.service");
class ServerController {
    // Lista todos os Servidores que pertencem às Orgs do Usuário Logado
    async getServers(req, res) {
        const userId = req.user?.id;
        // 🔒 PARTE 2: Escopo Multi-Tenant estrito onde o usuário é dono ou membro
        const servers = await prisma_1.default.server.findMany({
            where: {
                organization: {
                    OR: [
                        { ownerId: userId },
                        { members: { some: { userId } } }
                    ]
                }
            },
            include: {
                organization: {
                    select: { plan: true }
                },
                _count: {
                    select: { staffMembers: true, tickets: true }
                }
            }
        });
        // Mapear para incluir o campo 'plan' no nível raiz para compatibilidade com o frontend
        const serversWithPlan = servers.map(s => ({
            ...s,
            plan: s.organization?.plan || 'FREE'
        }));
        return res.json(serversWithPlan);
    }
    // Adiciona um banco de dados GuildID (Servidor Discord) apontando para uma Org
    async createServer(req, res) {
        // Ignoramos a OrgID bruta e usamos o que o middleware validou, ou forçamos
        const { discordGuildId, name, icon } = req.body;
        // 🔒 PARTE 2: Nunca confiar na Org do Body cegamente. Recuperando de params ou body validado.
        const organizationId = req.body.organizationId;
        const userId = req.user?.id;
        console.log('[DEBUG] createServer payload:', { organizationId, discordGuildId, name, icon });
        if (!organizationId || !discordGuildId || !name) {
            return res.status(400).json({ error: 'Dados incompletos passados no Payload.' });
        }
        // 🔒 PARTE 6: Transacional
        try {
            const result = await prisma_1.default.$transaction(async (tx) => {
                // Confirmar novamente se a Org existe e se o usuário tem contexto
                const org = await tx.organization.findUnique({
                    where: { id: organizationId },
                    include: { members: { where: { userId } } }
                });
                if (!org) {
                    throw new Error('NOT_FOUND');
                }
                if (org.ownerId !== userId && org.members.length === 0) {
                    throw new Error('FORBIDDEN');
                }
                // Criar
                const newServer = await tx.server.create({
                    data: {
                        organizationId: org.id, // Forçar amarração segura da Org carregada
                        discordGuildId,
                        name,
                        icon,
                        isActive: true,
                        config: JSON.stringify({ logChannel: "", staffRole: "" })
                    }
                });
                return newServer;
            });
            // Fora da transação (Auditoria)
            await audit_service_1.auditService.log({
                organizationId,
                userId: userId,
                action: 'SERVER_CREATED',
                resourceType: 'Server',
                resourceId: result.id,
                metadata: { guildId: discordGuildId, name }
            });
            console.log(`[DEBUG] Server ${result.id} successfully created via Transaction.`);
            return res.status(201).json(result);
        }
        catch (error) {
            console.error('[DEBUG] Prisma Tx error:', error);
            if (error.message === 'NOT_FOUND')
                return res.status(404).json({ error: 'Organização não encontrada.' });
            if (error.message === 'FORBIDDEN')
                return res.status(403).json({ error: 'Sem permissão para adicionar neste Workspace.' });
            if (error.code === 'P2002') {
                return res.status(400).json({ error: 'Este servidor do Discord já está registrado na plataforma.' });
            }
            return res.status(500).json({ error: 'Falha interna ao processar criação.' });
        }
    }
    // Atualiza Configuração em Tmp (FiveM / Canais)
    async updateConfig(req, res) {
        const serverId = req.params.id;
        const newConfigDto = req.body;
        const userId = req.user?.id;
        // Verificar propriedade
        const server = await prisma_1.default.server.findUnique({
            where: { id: serverId },
            include: { organization: true }
        });
        if (!server || server.organization.ownerId !== userId) {
            return res.status(403).json({ error: 'Sem permissão.' });
        }
        const currentConfig = JSON.parse(server.config || "{}");
        const updatedConfig = { ...currentConfig, ...newConfigDto };
        const updatedServer = await prisma_1.default.server.update({
            where: { id: serverId },
            data: { config: JSON.stringify(updatedConfig) }
        });
        await audit_service_1.auditService.log({
            organizationId: server.organizationId,
            userId: userId,
            action: 'SERVER_UPDATED',
            resourceType: 'Server',
            resourceId: serverId,
            metadata: {
                changedFields: Object.keys(newConfigDto),
                newValues: newConfigDto
            }
        });
        return res.json({ message: 'Config atualizada', data: updatedServer });
    }
    async deleteServer(req, res) {
        const { id } = req.params;
        const userId = req.user?.id;
        try {
            // Verificar se o servidor pertence a uma organização do usuário
            const server = await prisma_1.default.server.findFirst({
                where: {
                    id: id,
                    organization: {
                        ownerId: userId
                    }
                }
            });
            if (!server) {
                return res.status(404).json({ error: 'Servidor não encontrado ou sem permissão.' });
            }
            await prisma_1.default.server.delete({ where: { id: id } });
            await audit_service_1.auditService.log({
                organizationId: server.organizationId,
                userId: userId,
                action: 'SERVER_DELETED',
                resourceType: 'Server',
                resourceId: id,
                metadata: { serverName: server.name }
            });
            return res.json({ message: 'Servidor removido com sucesso.' });
        }
        catch (error) {
            console.error('[DEBUG] Delete server error:', error);
            return res.status(500).json({ error: 'Erro ao remover servidor.' });
        }
    }
}
exports.ServerController = ServerController;
