import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-do-not-use-in-production';

export class SupportController {

    // Gerar PIN de Acesso (Ação do Dono da Loja)
    async generatePin(req: Request, res: Response) {
        const organizationId = req.params.organizationId as string;
        const ownerId = req.user?.id;

        if (!ownerId) return res.status(401).json({ error: 'Não autorizado' });

        try {
            const org = await prisma.organization.findUnique({ where: { id: organizationId } });

            // Garantir que apenas o TENANT_OWNER (ou quem tem relação ownerId) consiga gerar
            if (!org || org.ownerId !== ownerId) {
                return res.status(403).json({ error: 'Apenas o dono da organização pode gerar um PIN de suporte' });
            }

            // Gerar PIN de 6 dígitos
            const pin = Math.floor(100000 + Math.random() * 900000).toString();

            // Hash simples usando SHA-256 (nunca armazenar PIN em plain text)
            const pinHash = crypto.createHash('sha256').update(pin).digest('hex');

            // Expira em 15 minutos (configurável)
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 15);

            const session = await prisma.supportSession.create({
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
        } catch (error) {
            console.error('[SUPPORT] Error generating PIN:', error);
            return res.status(500).json({ error: 'Erro ao gerar PIN de suporte' });
        }
    }

    // Listar as Sessões Ativas e Histórico Recente (Ação do Dono da Loja)
    async getActiveSessions(req: Request, res: Response) {
        const organizationId = req.params.organizationId as string;
        try {
            const sessions = await prisma.supportSession.findMany({
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
        } catch (error) {
            console.error('[SUPPORT] Error getting sessions:', error);
            return res.status(500).json({ error: 'Erro ao buscar sessões' });
        }
    }

    // Encerrar uma sessão de suporte ativa ou expirar PIN preventivamente (Dono da Loja)
    async revokeSession(req: Request, res: Response) {
        const organizationId = req.params.organizationId as string;
        const sessionId = req.params.sessionId as string;
        try {
            const session = await prisma.supportSession.findUnique({ where: { id: sessionId } });
            if (!session || session.organizationId !== organizationId) {
                return res.status(404).json({ error: 'Sessão não encontrada' });
            }

            await prisma.supportSession.update({
                where: { id: sessionId },
                data: { status: 'REVOKED' }
            });

            // Log da Ação (Usando o AuditService que criamos anteriormente)
            const { auditService } = await import('../services/domain/audit.service');
            await auditService.log({
                organizationId,
                userId: req.user!.id,
                action: 'SUPPORT_SESSION_REVOKED',
                resourceType: 'SupportSession',
                resourceId: sessionId
            });

            return res.json({ message: 'Sessão encerrada e PIN revogado com sucesso.' });
        } catch (error) {
            console.error('[SUPPORT] Error revoking session:', error);
            return res.status(500).json({ error: 'Erro ao revogar sessão' });
        }
    }

    // 🧑‍💻 Consumir o PIN (Lado da Equipe de Suporte do Orbias)
    async usePin(req: Request, res: Response) {
        const supportUserId = req.user?.id;
        const { pin } = req.body;

        if (!supportUserId) return res.status(401).json({ error: 'Não autorizado' });

        try {
            // Recriar o Hash para fazer query e encontrar a support session
            const pinHash = crypto.createHash('sha256').update(pin).digest('hex');

            // Tem que buscar PINs ativos e dentro da validade (15 min)
            const session = await prisma.supportSession.findFirst({
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
                await prisma.supportSession.update({ where: { id: session.id }, data: { status: 'EXPIRED' } });
                return res.status(401).json({ error: 'PIN já foi utilizado o número máximo de vezes.' });
            }

            // Marcar a Sessão como USED e incrementar contador (Impersonation Token Started)
            await prisma.supportSession.update({
                where: { id: session.id },
                data: {
                    status: 'USED',
                    usesCount: session.usesCount + 1,
                    supportUserId
                }
            });

            // Registrar Log de Impersonation (Rastreabilidade e Segurança p/ Dono da Loja)
            const { auditService } = await import('../services/domain/audit.service');
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
            const impersonationToken = jwt.sign(
                {
                    id: supportUserId,
                    role: req.user!.role,
                    username: req.user!.username,
                    impersonatingOrgId: session.organizationId, // IDENTIFICADOR ESSENCIAL
                    supportSessionId: session.id
                },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            return res.json({
                token: impersonationToken,
                organization: session.organization,
                message: `Você acessou a organização ${session.organization.name} temporariamente através de uso do PIN autorizado.`
            });
        } catch (error) {
            console.error('[SUPPORT] Error using PIN:', error);
            return res.status(500).json({ error: 'Erro ao processar PIN de Suporte' });
        }
    }
}
