import prisma from '../../lib/prisma';
import { eventBus } from '../event-bus';

interface SubmitAllowlistParams {
    formId: string;
    organizationId: string;
    serverId: string;
    userId: string;
    answers: { questionId: string; value: any }[];
    autoApprove: boolean;
    successMessage?: string | null;
    rejectMessage?: string | null;
    autoRoleId?: string | null;
}

export class AllowlistService {
    async getActiveFormByGuild(discordGuildId: string) {
        const server = await prisma.server.findUnique({
            where: { discordGuildId }
        });

        if (!server) return null;

        const form = await prisma.allowlistForm.findFirst({
            where: { serverId: server.id, status: 'active' },
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        return { server, form };
    }

    async submitForm(params: SubmitAllowlistParams) {
        // Decidir status baseado na config do form
        const status = params.autoApprove ? 'approved' : 'pending';

        // Salvar submission e respostas
        const submission = await prisma.allowlistSubmission.create({
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
