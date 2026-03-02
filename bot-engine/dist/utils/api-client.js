"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const coreApi = axios_1.default.create({
    baseURL: process.env.CORE_API_URL || 'http://localhost:4000',
    headers: {
        'Content-Type': 'application/json',
        // Internal service key (in production, replace with a proper service account JWT)
        'x-internal-service-key': process.env.INTERNAL_SERVICE_KEY || 'saasbot-internal-secret'
    },
    timeout: 5000,
});
exports.default = coreApi;
