import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';
import axios from 'axios';

/* FIX C1: lança erro se JWT_SECRET ausente — sem fallback em nenhum ambiente */
if (!process.env.JWT_SECRET) {
    throw new Error('[CONFIG] JWT_SECRET é obrigatório em todos os ambientes.');
}
const JWT_SECRET = process.env.JWT_SECRET;

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
            JWT_SECRET,
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
                JWT_SECRET,
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
        try {
            const { code } = req.body;

            if (!code) {
                console.error('[AUTH_CALLBACK_DISCORD_ERROR] Código ausente');
                return res.status(400).json({ error: 'Código de autorização é obrigatório' });
            }

            // 1️⃣ Troca "code" por access_token no Discord
            const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
            const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
            const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || '';

            const tokenResponse = await axios.post(
                'https://discord.com/api/oauth2/token',
                new URLSearchParams({
                    client_id: DISCORD_CLIENT_ID,
                    client_secret: DISCORD_CLIENT_SECRET,
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: DISCORD_REDIRECT_URI,
                }).toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const { access_token, token_type } = tokenResponse.data as {
                access_token: string;
                token_type: string;
            };

            // 2️⃣ Busca dados do usuário no Discord
            const userResponse = await axios.get('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `${token_type} ${access_token}`,
                    'Accept-Encoding': 'application/json'
                },
            });

            const discordUser = userResponse.data as {
                id: string;
                username: string;
                global_name?: string;
                avatar?: string | null;
                email?: string | null;
            };

            // 3️⃣ Upsert no Prisma
            const user = await prisma.user.upsert({
                where: { discordId: discordUser.id },
                create: {
                    discordId: discordUser.id,
                    username: discordUser.global_name || discordUser.username,
                    avatar: discordUser.avatar
                        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                        : null,
                    email: discordUser.email || null,
                    role: 'USER',
                },
                update: {
                    username: discordUser.global_name || discordUser.username,
                    avatar: discordUser.avatar
                        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                        : null,
                    email: discordUser.email || null,
                },
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

            // 4️⃣ Gera JWT
            const token = jwt.sign(
                {
                    id: user.id,
                    discordId: user.discordId,
                    role: user.role,
                    username: user.username,
                    avatar: user.avatar,
                },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            const isProduction = process.env.NODE_ENV === 'production';

            // 5️⃣ Seta cookie HTTP-Only com o nome 'token' (alinhado com o frontend)
            // Em produção: sameSite: 'none' + secure: true obrigatório para cross-subdomain
            // (orbitup.io → api.orbitup.io)
            res.cookie('token', token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? 'none' : 'lax',
                ...(isProduction ? { domain: '.orbitup.io' } : {}),
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
            });

            console.log(`[AUTH] ✅ Discord callback OK — user: ${user.username} (${user.id})`);

            // 6️⃣ Retorna JSON pro frontend também salvar em localStorage como fallback
            return res.json({ token, user, organization: org });
        } catch (error: any) {
            console.error('[AUTH_CALLBACK_DISCORD_ERROR]', error.response?.data || error.message || error);
            return res.status(500).json({ error: 'Falha interna durante callback do Discord', details: error.response?.data });
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

    // Logout: limpa o cookie de sessão server-side
    async logout(req: Request, res: Response) {
        const isProduction = process.env.NODE_ENV === 'production';

        // Clear host-only cookie variant
        res.cookie('token', '', {
            httpOnly: true,
            path: '/',
            maxAge: 0,
            sameSite: 'lax',
        });

        // Clear cross-subdomain production variant
        if (isProduction) {
            res.cookie('token', '', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                domain: '.orbitup.io',
                path: '/',
                maxAge: 0,
            });
        }

        console.log('[AUTH] ✅ Logout — cookie cleared');
        return res.json({ ok: true });
    }
}
