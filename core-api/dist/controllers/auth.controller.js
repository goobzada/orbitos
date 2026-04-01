"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
/* FIX C1: lança erro se JWT_SECRET ausente — sem fallback em nenhum ambiente */
if (!process.env.JWT_SECRET) {
    throw new Error('[CONFIG] JWT_SECRET é obrigatório em todos os ambientes.');
}
const JWT_SECRET = process.env.JWT_SECRET;
/* FIX B: Consistent cookie config for login/logout */
function getCookieConfig() {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieDomain = process.env.COOKIE_DOMAIN || '';
    return {
        httpOnly: true,
        // Se houver domínio ou for produção, deve ser secure para funcionar em HTTPS na VPS
        secure: isProduction || !!cookieDomain,
        sameSite: 'lax',
        path: '/',
        ...(cookieDomain ? { domain: cookieDomain } : {}),
    };
}
class AuthController {
    // Inicia OAuth Discord no backend para garantir client_id/redirect_uri consistentes
    async discordLogin(req, res) {
        const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
        const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || '';
        if (!DISCORD_CLIENT_ID || !DISCORD_REDIRECT_URI) {
            return res.status(500).json({ error: 'DISCORD_CLIENT_ID ou DISCORD_REDIRECT_URI não configurados.' });
        }
        /* FIX: Build authorize URL server-side so callback exchange uses the exact same OAuth app/config. */
        const params = new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            redirect_uri: DISCORD_REDIRECT_URI,
            response_type: 'code',
            scope: 'identify email',
            prompt: 'consent',
        });
        return res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
    }
    // Rota de Simulação (Mock) para não dependermos de registrar App no Discord agora
    async mockDiscordLogin(req, res) {
        const { discordId, username, avatar } = req.body;
        if (!discordId || !username) {
            return res.status(400).json({ error: 'discordId e username são obrigatórios' });
        }
        // Upsert (Cria ou Atualiza) o usuário
        // 🔒 MUDANÇA: Novos usuários são "USER" por padrão. SUPER_ADMIN deve ser promovido manualmente.
        const user = await prisma_1.default.user.upsert({
            where: { discordId },
            update: { username, avatar },
            create: { discordId, username, avatar, role: 'USER' }
        });
        // Se ele não tem Org, criar uma Org Grátis para ele + membership OWNER
        let org = await prisma_1.default.organization.findFirst({ where: { ownerId: user.id } });
        if (!org) {
            org = await prisma_1.default.organization.create({
                data: {
                    name: `${user.username}'s HQ`,
                    ownerId: user.id,
                    plan: 'FREE'
                }
            });
            // 🔒 NOVO: Criar OrganizationMember com role OWNER automaticamente
            await prisma_1.default.organizationMember.create({
                data: {
                    organizationId: org.id,
                    userId: user.id,
                    role: 'OWNER'
                }
            });
            console.log(`[AUTH] ✅ OrganizationMember OWNER criado para User ${user.id} na Org ${org.id}`);
        }
        else {
            // Garantir que o owner tem membership (para orgs antigas criadas antes do RBAC)
            await prisma_1.default.organizationMember.upsert({
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
        const token = jsonwebtoken_1.default.sign({ id: user.id, discordId: user.discordId, role: user.role, username: user.username, avatar: user.avatar }, JWT_SECRET, { expiresIn: '7d' });
        /* FIX: mock login must also set HttpOnly cookie to avoid auth flicker/redirect loops. */
        res.cookie('token', token, {
            ...getCookieConfig(),
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.json({ token, user, organization: org });
    }
    // ─── NOVO: Rota Multi-Provider OAuth ─────────────────────
    async oauthLogin(req, res) {
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
            let whereClause;
            if (provider === 'discord') {
                whereClause = { discordId: providerUserId };
            }
            else if (provider === 'google') {
                whereClause = { googleId: providerUserId };
            }
            else if (provider === 'github') {
                whereClause = { githubId: providerUserId };
            }
            else {
                return res.status(400).json({ error: 'Provider inválido.' });
            }
            user = await prisma_1.default.user.findFirst({ where: whereClause });
            // 2. Fallback: procurar por email se existe, e vincular id
            if (!user && email) {
                user = await prisma_1.default.user.findFirst({ where: { email } });
                if (user) {
                    await prisma_1.default.user.update({
                        where: { id: user.id },
                        data: { ...whereClause, avatar: avatar || user.avatar }
                    });
                }
            }
            // 3. Criar novo usuário
            if (!user) {
                user = await prisma_1.default.user.create({
                    data: {
                        ...whereClause,
                        username,
                        email,
                        avatar,
                        role: 'USER'
                    }
                });
            }
            else {
                // Opcional: sempre att username/avatar com infos recentes do github/google/discord
                user = await prisma_1.default.user.update({
                    where: { id: user.id },
                    data: { username, avatar: avatar || user.avatar }
                });
            }
            // 4. Garantir que tem Org/Membership OWNER
            let org = await prisma_1.default.organization.findFirst({ where: { ownerId: user.id } });
            if (!org) {
                org = await prisma_1.default.organization.create({
                    data: {
                        name: `${user.username}'s HQ`,
                        ownerId: user.id,
                        plan: 'FREE'
                    }
                });
                await prisma_1.default.organizationMember.create({
                    data: {
                        organizationId: org.id,
                        userId: user.id,
                        role: 'OWNER'
                    }
                });
            }
            else {
                await prisma_1.default.organizationMember.upsert({
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
            const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, username: user.username, avatar: user.avatar }, JWT_SECRET, { expiresIn: '7d' });
            /* FIX: oauth-login must set the same HttpOnly cookie as discord callback. */
            res.cookie('token', token, {
                ...getCookieConfig(),
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return res.json({ token, user, organization: org });
        }
        catch (error) {
            console.error('[AUTH_ERROR]', error);
            return res.status(500).json({ error: 'Falha interna durante login OAuth' });
        }
    }
    // ─── NOVO: Rota de Callback Real do Discord ─────────────────────
    async discordCallback(req, res) {
        try {
            const code = (req.method === 'GET'
                ? req.query.code
                : req.body?.code);
            const redirectWithError = (error, detail) => {
                const query = new URLSearchParams({ error });
                if (detail) {
                    query.set('detail', detail);
                }
                return res.redirect(302, `/login?${query.toString()}`);
            };
            if (!code) {
                console.error('[AUTH_CALLBACK_DISCORD_ERROR] Código ausente');
                if (req.method === 'GET') {
                    return redirectWithError('no_token', 'Código de autorização é obrigatório');
                }
                return res.status(400).json({ error: 'Código de autorização é obrigatório' });
            }
            // 1️⃣ Troca "code" por access_token no Discord
            const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
            const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
            const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || '';
            const tokenResponse = await axios_1.default.post('https://discord.com/api/oauth2/token', new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: DISCORD_REDIRECT_URI,
            }).toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            const { access_token, token_type } = tokenResponse.data;
            // 2️⃣ Busca dados do usuário no Discord
            const userResponse = await axios_1.default.get('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: `${token_type} ${access_token}`,
                    'Accept-Encoding': 'application/json'
                },
            });
            const discordUser = userResponse.data;
            // 3️⃣ Upsert no Prisma
            const user = await prisma_1.default.user.upsert({
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
            let org = await prisma_1.default.organization.findFirst({ where: { ownerId: user.id } });
            if (!org) {
                org = await prisma_1.default.organization.create({
                    data: {
                        name: `${user.username}'s HQ`,
                        ownerId: user.id,
                        plan: 'FREE'
                    }
                });
                await prisma_1.default.organizationMember.create({
                    data: {
                        organizationId: org.id,
                        userId: user.id,
                        role: 'OWNER'
                    }
                });
            }
            else {
                await prisma_1.default.organizationMember.upsert({
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
            const token = jsonwebtoken_1.default.sign({
                id: user.id,
                discordId: user.discordId,
                role: user.role,
                username: user.username,
                avatar: user.avatar,
            }, JWT_SECRET, { expiresIn: '7d' });
            /* FIX B: Use consistent cookie config helper */
            res.cookie('token', token, {
                ...getCookieConfig(),
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
            });
            console.log(`[AUTH] ✅ Discord callback OK — user: ${user.username} (${user.id})`);
            if (req.method === 'GET') {
                return res.redirect(302, '/dashboard');
            }
            // 6️⃣ Retorna JSON pro frontend também salvar em localStorage como fallback
            return res.json({ token, user, organization: org });
        }
        catch (error) {
            const discordErrData = error.response?.data;
            console.error('[AUTH_CALLBACK_DISCORD_ERROR]', discordErrData || error.message || error);
            // Se o Discord retornou erro OAuth, expor diretamente para o frontend detectar
            if (discordErrData?.error) {
                if (req.method === 'GET') {
                    const detail = discordErrData.error_description || discordErrData.error;
                    const query = new URLSearchParams({
                        error: 'discord_callback_failed',
                        detail,
                    });
                    return res.redirect(302, `/login?${query.toString()}`);
                }
                return res.status(400).json({
                    error: discordErrData.error,
                    error_description: discordErrData.error_description || '',
                    details: discordErrData,
                });
            }
            if (req.method === 'GET') {
                const detail = discordErrData || error.message || 'Falha interna durante callback do Discord';
                const query = new URLSearchParams({
                    error: 'discord_callback_failed',
                    detail: typeof detail === 'string' ? detail : JSON.stringify(detail),
                });
                return res.redirect(302, `/login?${query.toString()}`);
            }
            return res.status(500).json({ error: 'Falha interna durante callback do Discord', details: discordErrData || error.message });
        }
    }
    // Rota para o FrontEnd pedir suas próprias informações após injetar o header
    async me(req, res) {
        const userId = req.user?.id;
        const user = await prisma_1.default.user.findUnique({
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
    async logout(req, res) {
        /* FIX B: Clear cookie using SAME attributes as login to ensure removal */
        res.cookie('token', '', {
            ...getCookieConfig(),
            maxAge: 0,
            expires: new Date(0),
        });
        console.log('[AUTH] ✅ Logout — cookie cleared');
        // Browser-driven GET logout should return user to login page.
        if (req.method === 'GET') {
            return res.redirect(302, '/login');
        }
        return res.json({ ok: true });
    }
}
exports.AuthController = AuthController;
