"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditService = exports.AuditService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
class AuditService {
    async log(params) {
        try {
            await prisma_1.default.auditLog.create({
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
        }
        catch (error) {
            console.error('[AUDIT LOG ERROR]', error);
        }
    }
}
exports.AuditService = AuditService;
exports.auditService = new AuditService();
