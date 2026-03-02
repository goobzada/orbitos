"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllowlistService = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
class AllowlistService {
    async getActiveFormByGuild(discordGuildId) {
        const server = await prisma_1.default.server.findUnique({
            where: { discordGuildId }
        });
        if (!server)
            return null;
        const form = await prisma_1.default.allowlistForm.findFirst({
            where: { serverId: server.id, status: 'active' },
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                }
            }
        });
        return { server, form };
    }
    async submitForm(params) {
        // Decidir status baseado na config do form
        const status = params.autoApprove ? 'approved' : 'pending';
        // Salvar submission e respostas
        const submission = await prisma_1.default.allowlistSubmission.create({
            data: {
                formId: params.formId,
                organizationId: params.organizationId,
                serverId: params.serverId,
                userId: params.userId,
                status,
                answers: {
                    create: params.answers.map(ans => ({
                        questionId: ans.questionId,
                        value: typeof ans.value === 'string' ? ans.value : JSON.stringify(ans.value)
                    }))
                }
            }
        });
        return {
            submission,
            status,
            successMessage: params.successMessage,
            rejectMessage: params.rejectMessage,
            autoRoleId: status === 'approved' ? params.autoRoleId : undefined
        };
    }
}
exports.AllowlistService = AllowlistService;
