import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export class StatsController {
    // Retorna os dados agregados para o Dashboard
    async getOverview(req: Request, res: Response) {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Não autorizado' });
        }

        try {
            // 1. Pegar todas as Orgs que o usuário é dono ou membro
            const userOrgs = await prisma.organization.findMany({
                where: {
                    OR: [
                        { ownerId: userId },
                        { members: { some: { userId } } }
                    ]
                },
                select: { id: true }
            });

            const orgIds = userOrgs.map(o => o.id);

            // 2. Servidores Ativos (reais dessas orgs)
            const activeServers = await prisma.server.count({
                where: {
                    organizationId: { in: orgIds },
                    isActive: true
                }
            });

            // 3. Tickets Abertos (reais)
            const openTickets = await prisma.ticket.count({
                where: {
                    organizationId: { in: orgIds },
                    status: 'OPEN'
                }
            });

            // 4. Staff Online (reais em todos os servidores dessas orgs)
            const totalStaff = await prisma.staffMember.count({
                where: {
                    server: { organizationId: { in: orgIds } }
                }
            });

            // 5. Faturamento Total (24h) - Soma de pedidos pagos nas últimas 24h
            const last24h = new Date();
            last24h.setHours(last24h.getHours() - 24);

            const revenue24h = await prisma.storeOrder.aggregate({
                where: {
                    organizationId: { in: orgIds },
                    status: 'PAID',
                    paidAt: { gte: last24h }
                },
                _sum: { totalCents: true }
            });

            const revenueFormatted = (revenue24h._sum.totalCents || 0) / 100;

            // 6. Dados para o gráfico de crescimento (últimos 6 meses)
            // Aqui fazemos uma query para agrupar ordens pagas por mês
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const orders = await prisma.storeOrder.findMany({
                where: {
                    organizationId: { in: orgIds },
                    status: 'PAID',
                    paidAt: { gte: sixMonthsAgo }
                },
                select: { totalCents: true, paidAt: true }
            });

            // Agrupar e formatar para o Recharts
            const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
            const chartDataRaw: Record<string, { revenue: number, count: number }> = {};

            // Preencher meses vazios
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const m = monthNames[d.getMonth()];
                chartDataRaw[m] = { revenue: 0, count: 0 };
            }

            orders.forEach(order => {
                if (order.paidAt) {
                    const m = monthNames[order.paidAt.getMonth()];
                    if (chartDataRaw[m]) {
                        chartDataRaw[m].revenue += order.totalCents / 100;
                        chartDataRaw[m].count += 1;
                    }
                }
            });

            const chartData = Object.entries(chartDataRaw).map(([month, data]) => ({
                month,
                revenue: data.revenue,
                orders: data.count
            }));

            return res.json({
                activeServers,
                activeServersTrend: 0,
                openTickets,
                openTicketsTrend: 0,
                staffOnline: totalStaff,
                staffTrend: 0,
                revenue24h: revenueFormatted,
                revenueTrend: 15.4, // Trend comparado ao dia anterior - TODO: Calcular real
                chartData,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar métricas reais.' });
        }
    }

    async getRecentAudit(req: Request, res: Response) {
        const userId = req.user?.id;
        const limit = Number(req.query.limit) || 10;

        if (!userId) {
            return res.status(401).json({ error: 'Não autorizado' });
        }

        try {
            // Get user's org IDs
            const userOrgs = await prisma.organization.findMany({
                where: {
                    OR: [
                        { ownerId: userId },
                        { members: { some: { userId } } }
                    ]
                },
                select: { id: true }
            });

            const orgIds = userOrgs.map(o => o.id);

            const activities = await prisma.auditLog.findMany({
                where: {
                    OR: [
                        { userId },
                        { organizationId: { in: orgIds } }
                    ]
                },
                orderBy: { createdAt: 'desc' },
                take: limit
            });
            return res.json(activities);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao buscar atividades.' });
        }
    }
}
