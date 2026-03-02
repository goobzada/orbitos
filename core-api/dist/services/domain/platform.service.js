"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
class PlatformService {
    async getGlobalMetrics() {
        const totalOrganizations = await prisma_1.default.organization.count();
        const totalUsers = await prisma_1.default.user.count();
        const totalServers = await prisma_1.default.server.count();
        const totalTickets = await prisma_1.default.ticket.count();
        const totalAllowlistSubmissions = await prisma_1.default.allowlistSubmission.count();
        const totalPayments = await prisma_1.default.payment.count();
        const revenueResult = await prisma_1.default.payment.aggregate({
            _sum: { amount: true },
            where: { status: 'paid' }
        });
        const totalRevenue = revenueResult._sum.amount || 0;
        // Metric Operacionais
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        const ticketsLast30Days = await prisma_1.default.ticket.count({
            where: { createdAt: { gte: thirtyDaysAgo } }
        });
        const automationsLast30Days = await prisma_1.default.automationLog.count({
            where: { createdAt: { gte: thirtyDaysAgo } }
        });
        const errorsLast24Hours = await prisma_1.default.automationLog.count({
            where: {
                createdAt: { gte: twentyFourHoursAgo },
                status: 'FAILED'
            }
        });
        // Distribution
        const freeOrgs = await prisma_1.default.organization.count({ where: { plan: 'FREE' } });
        const proOrgs = await prisma_1.default.organization.count({ where: { plan: 'PRO' } });
        const enterpriseOrgs = await prisma_1.default.organization.count({ where: { plan: 'ENTERPRISE' } });
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
exports.PlatformService = PlatformService;
