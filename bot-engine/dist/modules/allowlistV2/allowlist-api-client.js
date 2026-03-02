"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowlistClient = exports.AllowlistApiClient = void 0;
const api_client_1 = __importDefault(require("../../utils/api-client"));
class AllowlistApiClient {
    async getActiveForm(guildId) {
        try {
            const { data } = await api_client_1.default.get(`/internal/allowlist/active-form?guildId=${guildId}`);
            return data;
        }
        catch (error) {
            const err = error;
            if (err.response?.status === 404) {
                return null;
            }
            throw new Error(`Erro ao buscar form ativo: ${err.message}`);
        }
    }
    async submitAllowlist(formId, payload) {
        const { data } = await api_client_1.default.post(`/internal/allowlist/forms/${formId}/submit`, payload);
        return data;
    }
}
exports.AllowlistApiClient = AllowlistApiClient;
exports.allowlistClient = new AllowlistApiClient();
