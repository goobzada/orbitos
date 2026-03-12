import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

let loaded = false;
let loadedFrom: string | null = null;

export function loadBotEnv(): string {
    if (loaded) return loadedFrom || '.env';

    const cwd = process.cwd();
    const devEnvPath = path.resolve(cwd, '.env');
    const prodEnvPath = path.resolve(cwd, '.env.production');

    // Always load default .env first when available.
    if (fs.existsSync(devEnvPath)) {
        dotenv.config({ path: devEnvPath, override: true });
        loadedFrom = '.env';
    }

    // In production, prefer .env.production values when file exists.
    if (process.env.NODE_ENV === 'production' && fs.existsSync(prodEnvPath)) {
        dotenv.config({ path: prodEnvPath, override: true });
        loadedFrom = '.env.production';
    }

    // Fallback if nothing loaded yet.
    if (!loadedFrom) {
        dotenv.config({ override: true });
        loadedFrom = '.env';
    }

    loaded = true;
    return loadedFrom;
}
