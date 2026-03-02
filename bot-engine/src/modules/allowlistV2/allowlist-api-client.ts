import coreApi from '../../utils/api-client';

export type AllowlistQuestionType =
    | 'short_text'
    | 'long_text'
    | 'number'
    | 'select'
    | 'multi_select'
    | 'captcha_code'
    | 'terms';

export interface AllowlistForm {
    id: string;
    organizationId: string;
    guildId: string;
    name: string;
    status: 'active' | 'draft' | 'disabled';
    mode: 'simple' | 'advanced';
    successMessage: string | null;
    rejectMessage: string | null;
    autoApprove: boolean;
    autoRoleId?: string;
    logChannelId?: string;
}

export interface AllowlistQuestion {
    id: string;
    formId: string;
    order: number;
    label: string;
    placeholder?: string;
    type: AllowlistQuestionType;
    required: boolean;
    options?: string; // JSON
    validation?: string; // JSON
}

export interface AllowlistSubmissionResponse {
    status: 'pending' | 'approved' | 'rejected';
    successMessage?: string;
    rejectMessage?: string;
    autoRoleId?: string;
}

export class AllowlistApiClient {
    async getActiveForm(guildId: string): Promise<{ form: AllowlistForm; questions: AllowlistQuestion[] } | null> {
        try {
            const { data } = await coreApi.get(`/internal/allowlist/active-form?guildId=${guildId}`);
            return data;
        } catch (error: unknown) {
            const err = error as { response?: { status?: number }, message: string };
            if (err.response?.status === 404) {
                return null;
            }
            throw new Error(`Erro ao buscar form ativo: ${err.message}`);
        }
    }

    async submitAllowlist(formId: string, payload: {
        guildId: string;
        userId: string;
        answers: { questionId: string; value: string | string[] }[];
    }): Promise<AllowlistSubmissionResponse> {
        const { data } = await coreApi.post(`/internal/allowlist/forms/${formId}/submit`, payload);
        return data;
    }
}

export const allowlistClient = new AllowlistApiClient();
