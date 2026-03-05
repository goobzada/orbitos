import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

function normalizeCoreApiUrl(rawUrl?: string): string {
    const fallback = 'http://localhost:4000';
    const value = (rawUrl || fallback).trim().replace(/\/+$/, '');

    // In production, dashboard and bot access API behind /api namespace.
    if (/^https?:\/\//i.test(value) && !/\/api$/i.test(value) && process.env.NODE_ENV === 'production') {
        return `${value}/api`;
    }

    return value;
}

const coreApi = axios.create({
    baseURL: normalizeCoreApiUrl(process.env.CORE_API_URL),
    headers: {
        'Content-Type': 'application/json',
        // Internal service key (in production, replace with a proper service account JWT)
        'x-internal-service-key': process.env.INTERNAL_SERVICE_KEY || 'saasbot-internal-secret'
    },
    timeout: 2500, // Discord tem 3s de limite — API deve responder antes
});

export default coreApi;
