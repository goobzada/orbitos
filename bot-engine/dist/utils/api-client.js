"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const load_env_1 = require("./load-env");
(0, load_env_1.loadBotEnv)();
function normalizeCoreApiUrl(rawUrl) {
    const fallback = 'http://localhost:4000';
    const value = (rawUrl || fallback).trim().replace(/\/+$/, '');
    // In production, dashboard and bot access API behind /api namespace.
    if (/^https?:\/\//i.test(value) && !/\/api$/i.test(value) && process.env.NODE_ENV === 'production') {
        return `${value}/api`;
    }
    return value;
}
const coreApi = axios_1.default.create({
    baseURL: normalizeCoreApiUrl(process.env.CORE_API_URL),
    headers: {
        'Content-Type': 'application/json',
        // Internal service key (in production, replace with a proper service account JWT)
        'x-internal-service-key': process.env.INTERNAL_SERVICE_KEY || 'saasbot-internal-secret'
    },
    timeout: 2500, // Discord tem 3s de limite — API deve responder antes
});
coreApi.interceptors.response.use((response) => response, async (error) => {
    const status = error?.response?.status;
    const originalConfig = error?.config;
    const originalUrl = String(originalConfig?.url || '');
    const currentBase = String(originalConfig?.baseURL || coreApi.defaults.baseURL || '').replace(/\/+$/, '');
    // Safety fallback: if internal routes hit a 404 due to missing /api namespace,
    // retry once against the namespaced base URL.
    const isInternalRoute = originalUrl.startsWith('/internal/');
    const canRetry = status === 404 && isInternalRoute && !originalConfig?.__retriedWithApiNamespace;
    const baseMissingApi = /^https?:\/\//i.test(currentBase) && !/\/api$/i.test(currentBase);
    if (canRetry && baseMissingApi) {
        originalConfig.__retriedWithApiNamespace = true;
        originalConfig.baseURL = `${currentBase}/api`;
        return coreApi.request(originalConfig);
    }
    return Promise.reject(error);
});
exports.default = coreApi;
