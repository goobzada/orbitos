import prisma from '../../lib/prisma';

interface LogAuditParams {
    organizationId?: string | null;
    userId?: string | null;
    action: string;
    resourceType: string;
    resourceId?: string | null;
    metadata?: any;
}

export class AuditService {
    async log(params: LogAuditParams) {
        try {
            await prisma.auditLog.create({
                data: {
                    organizationId: params.organizationId,
                    userId: params.userId,
                    action: params.action,
                    resourceType: params.resourceType,
                    resourceId: params.resourceId,
                    metadata: params.metadata ? JSON.stringify(params.metadata) : null,
                },
            });
            console.log(`[AUDIT LOG] ${params.action} em ${params.resourceType} (${params.resourceId})`);
        } catch (error) {
            console.error('[AUDIT LOG ERROR]', error);
        }
    }
}

export const auditService = new AuditService();
