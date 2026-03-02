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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportController = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-do-not-use-in-production';
class SupportController {
    // Gerar PIN de Acesso (Ação do Dono da Loja)
    async generatePin(req, res) {
        const organizationId = req.params.organizationId;
        const ownerId = req.user?.id;
        if (!ownerId)
            return res.status(401).json({ error: 'Não autorizado' });
        try {
            const org = await prisma_1.default.organization.findUnique({ where: { id: organizationId } });
            // Garantir que apenas o TENANT_OWNER (ou quem tem relação ownerId) consiga gerar
            if (!org || org.ownerId !== ownerId) {
                return res.status(403).json({ error: 'Apenas o dono da organização pode gerar um PIN de suporte' });
            }
            // Gerar PIN de 6 dígitos
            const pin = Math.floor(100000 + Math.random() * 900000).toString();
            // Hash simples usando SHA-256 (nunca armazenar PIN em plain text)
            const pinHash = crypto_1.default.createHash('sha256').update(pin).digest('hex');
            // Expira em 15 minutos (configurável)
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 15);
            const session = await prisma_1.default.supportSession.create({
                data: {
                    organizationId,
                    ownerId,
                    pinHash,
                    status: 'ACTIVE',
                    expiresAt,
                    maxUses: 1,
                    permissions: ["VIEW_SETTINGS", "EDIT_BASIC_CONFIG", "VIEW_LOGS"] // Regras de escopo
                }
            });
            // 📊 PARTE DA REGRA DE NEGÓCIO: Só expomos o PIN em texto puro 1 única vez aqui
            return res.status(201).json({
                session: { id: session.id, expiresAt: session.expiresAt },
                pin
            });
        }
        catch (error) {
            console.error('[SUPPORT] Error generating PIN:', error);
            return res.status(500).json({ error: 'Erro ao gerar PIN de suporte' });
        }
    }
    // Listar as Sessões Ativas e Histórico Recente (Ação do Dono da Loja)
    async getActiveSessions(req, res) {
        const organizationId = req.params.organizationId;
        try {
            const sessions = await prisma_1.default.supportSession.findMany({
                where: { organizationId },
                orderBy: { createdAt: 'desc' },
                take: 10
            });
            // Omitimos o hash por segurança
            const mapped = sessions.map(s => ({
                id: s.id,
                status: s.status,
                createdAt: s.createdAt,
                expiresAt: s.expiresAt,
                usesCount: s.usesCount
            }));
            return res.json(mapped);
        }
        catch (error) {
            console.error('[SUPPORT] Error getting sessions:', error);
            return res.status(500).json({ error: 'Erro ao buscar sessões' });
        }
    }
    // Encerrar uma sessão de suporte ativa ou expirar PIN preventivamente (Dono da Loja)
    async revokeSession(req, res) {
        const organizationId = req.params.organizationId;
        const sessionId = req.params.sessionId;
        try {
            const session = await prisma_1.default.supportSession.findUnique({ where: { id: sessionId } });
            if (!session || session.organizationId !== organizationId) {
                return res.status(404).json({ error: 'Sessão não encontrada' });
            }
            await prisma_1.default.supportSession.update({
                where: { id: sessionId },
                data: { status: 'REVOKED' }
            });
            // Log da Ação (Usando o AuditService que criamos anteriormente)
            const { auditService } = await Promise.resolve().then(() => __importStar(require('../services/domain/audit.service')));
            await auditService.log({
                organizationId,
                userId: req.user.id,
                action: 'SUPPORT_SESSION_REVOKED',
                resourceType: 'SupportSession',
                resourceId: sessionId
            });
            return res.json({ message: 'Sessão encerrada e PIN revogado com sucesso.' });
        }
        catch (error) {
            console.error('[SUPPORT] Error revoking session:', error);
            return res.status(500).json({ error: 'Erro ao revogar sessão' });
        }
    }
    // 🧑‍💻 Consumir o PIN (Lado da Equipe de Suporte do Orbias)
    async usePin(req, res) {
        const supportUserId = req.user?.id;
        const { pin } = req.body;
        if (!supportUserId)
            return res.status(401).json({ error: 'Não autorizado' });
        try {
            // Recriar o Hash para fazer query e encontrar a support session
            const pinHash = crypto_1.default.createHash('sha256').update(pin).digest('hex');
            // Tem que buscar PINs ativos e dentro da validade (15 min)
            const session = await prisma_1.default.supportSession.findFirst({
                where: {
                    pinHash,
                    status: 'ACTIVE',
                    expiresAt: { gt: new Date() }
                },
                include: {
                    organization: true
                }
            });
            if (!session) {
                return res.status(401).json({ error: 'PIN inválido, já utilizado ou expirado.' });
            }
            if (session.usesCount >= session.maxUses) {
                await prisma_1.default.supportSession.update({ where: { id: session.id }, data: { status: 'EXPIRED' } });
                return res.status(401).json({ error: 'PIN já foi utilizado o número máximo de vezes.' });
            }
            // Marcar a Sessão como USED e incrementar contador (Impersonation Token Started)
            await prisma_1.default.supportSession.update({
                where: { id: session.id },
                data: {
                    status: 'USED',
                    usesCount: session.usesCount + 1,
                    supportUserId
                }
            });
            // Registrar Log de Impersonation (Rastreabilidade e Segurança p/ Dono da Loja)
            const { auditService } = await Promise.resolve().then(() => __importStar(require('../services/domain/audit.service')));
            await auditService.log({
                organizationId: session.organizationId,
                userId: supportUserId,
                action: 'SUPPORT_IMPERSONATION_STARTED',
                resourceType: 'SupportSession',
                resourceId: session.id,
                metadata: { ip: req.ip, agent: req.headers['user-agent'] }
            });
            // Gerar um Token de Suporte Temporário (Impersonation Token Válido por 1h ou 40min)
            // Esse JWT carrega a indicação de que o usuário é um Staff OrbitOS atuando como cliente
            const impersonationToken = jsonwebtoken_1.default.sign({
                id: supportUserId,
                role: req.user.role,
                username: req.user.username,
                impersonatingOrgId: session.organizationId, // IDENTIFICADOR ESSENCIAL
                supportSessionId: session.id
            }, JWT_SECRET, { expiresIn: '1h' });
            return res.json({
                token: impersonationToken,
                organization: session.organization,
                message: `Você acessou a organização ${session.organization.name} temporariamente através de uso do PIN autorizado.`
            });
        }
        catch (error) {
            console.error('[SUPPORT] Error using PIN:', error);
            return res.status(500).json({ error: 'Erro ao processar PIN de Suporte' });
        }
    }
}
exports.SupportController = SupportController;
