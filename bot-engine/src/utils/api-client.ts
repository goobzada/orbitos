import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const coreApi = axios.create({
    baseURL: process.env.CORE_API_URL || 'http://localhost:4000',
    headers: {
        'Content-Type': 'application/json',
        // Internal service key (in production, replace with a proper service account JWT)
        'x-internal-service-key': process.env.INTERNAL_SERVICE_KEY || 'saasbot-internal-secret'
    },
    timeout: 2500, // Discord tem 3s de limite — API deve responder antes
});

export default coreApi;
