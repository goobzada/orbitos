import prisma from '../../lib/prisma';

export class PlatformService {
    async getGlobalMetrics() {
        const totalOrganizations = await prisma.organization.count();
        const totalUsers = await prisma.user.count();
        const totalServers = await prisma.server.count();
        const totalTickets = await prisma.ticket.count();
        const totalAllowlistSubmissions = await prisma.allowlistSubmission.count();
        const totalPayments = await prisma.payment.count();

        const revenueResult = await prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: 'paid' }
        });
        const totalRevenue = revenueResult._sum.amount || 0;

        // Metric Operacionais
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const ticketsLast30Days = await prisma.ticket.count({
            where: { createdAt: { gte: thirtyDaysAgo } }
        });

        const automationsLast30Days = await prisma.automationLog.count({
            where: { createdAt: { gte: thirtyDaysAgo } }
        });

        const errorsLast24Hours = await prisma.automationLog.count({
            where: {
                createdAt: { gte: twentyFourHoursAgo },
                status: 'FAILED'
            }
        });

        // Distribution
        const freeOrgs = await prisma.organization.count({ where: { plan: 'FREE' } });
        const proOrgs = await prisma.organization.count({ where: { plan: 'PRO' } });
        const enterpriseOrgs = await prisma.organization.count({ where: { plan: 'ENTERPRISE' } });

        return {
            totals: {
                totalOrganizations,
                totalUsers,
                totalServers,
                totalTickets,
                totalAllowlistSubmissions,
                totalPayments
            },
            revenue: {
                totalRevenue
            },
            operational: {
                ticketsLast30Days,
                automationsLast30Days,
                errorsLast24Hours
            },
            orgDistribution: {
                FREE: freeOrgs,
                PRO: proOrgs,
                ENTERPRISE: enterpriseOrgs
            }
        };
    }
}
