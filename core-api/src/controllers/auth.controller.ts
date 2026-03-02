import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// 🔒 Validação na inicialização
if (!JWT_SECRET || JWT_SECRET.trim() === '') {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
        console.error('🔴 FATAL: JWT_SECRET não definida. Abortando em produção.');
        process.exit(1);
    } else {
        console.warn('⚠️ AVISO: JWT_SECRET não definida. Usando chave padrão DEV.');
    }
}

const RESOLVED_SECRET = JWT_SECRET || 'dev-jwt-secret-do-not-use-in-production';

export class AuthController {

    // Rota de Simulação (Mock) para não dependermos de registrar App no Discord agora
    async mockDiscordLogin(req: Request, res: Response) {
        const { discordId, username, avatar } = req.body;

        if (!discordId || !username) {
            return res.status(400).json({ error: 'discordId e username são obrigatórios' });
        }

        // Upsert (Cria ou Atualiza) o usuário
        // 🔒 MUDANÇA: Novos usuários são "USER" por padrão. SUPER_ADMIN deve ser promovido manualmente.
        const user = await prisma.user.upsert({
            where: { discordId },
            update: { username, avatar },
            create: { discordId, username, avatar, role: 'USER' }
        });

        // Se ele não tem Org, criar uma Org Grátis para ele + membership OWNER
        let org = await prisma.organization.findFirst({ where: { ownerId: user.id } });

        if (!org) {
            org = await prisma.organization.create({
                data: {
                    name: `${user.username}'s HQ`,
                    ownerId: user.id,
                    plan: 'FREE'
                }
            });

            // 🔒 NOVO: Criar OrganizationMember com role OWNER automaticamente
            await prisma.organizationMember.create({
                data: {
                    organizationId: org.id,
                    userId: user.id,
                    role: 'OWNER'
                }
            });

            console.log(`[AUTH] ✅ OrganizationMember OWNER criado para User ${user.id} na Org ${org.id}`);
        } else {
            // Garantir que o owner tem membership (para orgs antigas criadas antes do RBAC)
            await prisma.organizationMember.upsert({
                where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
                update: {},
                create: {
                    organizationId: org.id,
                    userId: user.id,
                    role: 'OWNER'
                }
            });
        }

        // Assina e devolve o Token
        const token = jwt.sign(
            { id: user.id, discordId: user.discordId, role: user.role, username: user.username, avatar: user.avatar },
            RESOLVED_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({ token, user, organization: org });
    }

    // ─── NOVO: Rota Multi-Provider OAuth ─────────────────────
    async oauthLogin(req: Request, res: Response) {
        const { provider, providerUserId, email, username, avatar } = req.body;

        if (!provider || !providerUserId || !username) {
            return res.status(400).json({ error: 'provider, providerUserId e username são obrigatórios' });
        }

        const validProviders = ['discord', 'google', 'github'];
        if (!validProviders.includes(provider)) {
            return res.status(400).json({ error: 'Provider inválido. Use discord, google ou github.' });
        }

        try {
            let user = null;

            // 1. Tentar achar por Provider ID específico
            type ProviderWhereClause =
                | { discordId: string }
                | { googleId: string }
                | { githubId: string };

            let whereClause: ProviderWhereClause;

            if (provider === 'discord') {
                whereClause = { discordId: providerUserId };
            } else if (provider === 'google') {
                whereClause = { googleId: providerUserId };
            } else if (provider === 'github') {
                whereClause = { githubId: providerUserId };
            } else {
                return res.status(400).json({ error: 'Provider inválido.' });
            }

            user = await prisma.user.findFirst({ where: whereClause });

            // 2. Fallback: procurar por email se existe, e vincular id
            if (!user && email) {
                user = await prisma.user.findFirst({ where: { email } });
                if (user) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { ...whereClause, avatar: avatar || user.avatar }
                    });
                }
            }

            // 3. Criar novo usuário
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        ...whereClause,
                        username,
                        email,
                        avatar,
                        role: 'USER'
                    }
                });
            } else {
                // Opcional: sempre att username/avatar com infos recentes do github/google/discord
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { username, avatar: avatar || user.avatar }
                });
            }

            // 4. Garantir que tem Org/Membership OWNER
            let org = await prisma.organization.findFirst({ where: { ownerId: user.id } });

            if (!org) {
                org = await prisma.organization.create({
                    data: {
                        name: `${user.username}'s HQ`,
                        ownerId: user.id,
                        plan: 'FREE'
                    }
                });

                await prisma.organizationMember.create({
                    data: {
                        organizationId: org.id,
                        userId: user.id,
                        role: 'OWNER'
                    }
                });
            } else {
                await prisma.organizationMember.upsert({
                    where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
                    update: {},
                    create: {
                        organizationId: org.id,
                        userId: user.id,
                        role: 'OWNER'
                    }
                });
            }

            // 5. Gerar JWT
            const token = jwt.sign(
                { id: user.id, role: user.role, username: user.username, avatar: user.avatar },
                RESOLVED_SECRET,
                { expiresIn: '7d' }
            );

            return res.json({ token, user, organization: org });

        } catch (error) {
            console.error('[AUTH_ERROR]', error);
            return res.status(500).json({ error: 'Falha interna durante login OAuth' });
        }
    }

    // ─── NOVO: Rota de Callback Real do Discord ─────────────────────
    async discordCallback(req: Request, res: Response) {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Código de autorização é obrigatório' });
        }

        try {
            // 1. Trocar o código por um Access Token
            const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: process.env.DISCORD_CLIENT_ID || '',
                    client_secret: process.env.DISCORD_CLIENT_SECRET || '',
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: process.env.DISCORD_REDIRECT_URI || '',
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });

            const tokenData: any = await tokenResponse.json();

            if (tokenData.error) {
                console.error('[AUTH] Erro ao obter token do Discord:', tokenData);
                return res.status(400).json({ error: 'Erro ao autenticar com o Discord (token exchange)' });
            }

            // 2. Buscar informações do usuário no Discord
            const userResponse = await fetch('https://discord.com/api/users/@me', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });

            const discordUser: any = await userResponse.json();

            if (!discordUser.id) {
                console.error('[AUTH] Erro ao obter usuário do Discord:', discordUser);
                return res.status(400).json({ error: 'Erro ao obter dados do usuário do Discord' });
            }

            // 3. Upsert (Cria ou Atualiza) o usuário
            const avatar = discordUser.avatar
                ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/${parseInt(discordUser.id.slice(-1)) % 5}.png`;

            const user = await prisma.user.upsert({
                where: { discordId: discordUser.id },
                update: {
                    username: discordUser.username,
                    avatar,
                    email: discordUser.email || null
                },
                create: {
                    discordId: discordUser.id,
                    username: discordUser.username,
                    avatar,
                    email: discordUser.email || null,
                    role: 'USER'
                }
            });

            // 4. Garantir Org/Membership OWNER
            let org = await prisma.organization.findFirst({ where: { ownerId: user.id } });

            if (!org) {
                org = await prisma.organization.create({
                    data: {
                        name: `${user.username}'s HQ`,
                        ownerId: user.id,
                        plan: 'FREE'
                    }
                });

                await prisma.organizationMember.create({
                    data: {
                        organizationId: org.id,
                        userId: user.id,
                        role: 'OWNER'
                    }
                });
            } else {
                await prisma.organizationMember.upsert({
                    where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
                    update: {},
                    create: {
                        organizationId: org.id,
                        userId: user.id,
                        role: 'OWNER'
                    }
                });
            }

            // 5. Gerar JWT
            const token = jwt.sign(
                { id: user.id, discordId: user.discordId, role: user.role, username: user.username, avatar: user.avatar },
                RESOLVED_SECRET,
                { expiresIn: '7d' }
            );

            return res.json({ token, user, organization: org });

        } catch (error) {
            console.error('[AUTH_CALLBACK_DISCORD_ERROR]', error);
            return res.status(500).json({ error: 'Falha interna durante callback do Discord' });
        }
    }

    // Rota para o FrontEnd pedir suas próprias informações após injetar o header
    async me(req: Request, res: Response) {
        const userId = req.user?.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                organizations: true,
                orgMemberships: {
                    include: { organization: true }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        return res.json(user);
    }
}
