import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// Strict hostname regex — only valid domain characters allowed to prevent injection
const VALID_DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const PROVISION_SCRIPT = process.env.PROVISION_SCRIPT_PATH
    || path.resolve(__dirname, '../../../scripts/provision-domain.sh');

export type ProvisionResult =
    | { success: true; output: string }
    | { success: false; error: string; exitCode?: number };

export class DomainProvisionService {
    /**
     * Provisions an nginx server block + Let's Encrypt SSL for a custom domain.
     * Only call this AFTER DNS verification succeeds.
     *
     * @param domain - The validated, verified custom domain (e.g. "loja.example.com")
     * @param targetPort - The local port to proxy to (defaults to web app port 3001)
     */
    static async provision(domain: string, targetPort = 3001): Promise<ProvisionResult> {
        if (!VALID_DOMAIN_RE.test(domain)) {
            return { success: false, error: `Invalid domain format: ${domain}` };
        }

        // Sanitize: only pass validated values to the shell — no shell metacharacters possible
        const sanitizedDomain = domain.toLowerCase().trim();
        const sanitizedPort = Number.isInteger(targetPort) && targetPort > 0 && targetPort < 65536
            ? targetPort
            : 3001;

        const env = process.env.CERTBOT_EMAIL
            ? { ...process.env }
            : { ...process.env, CERTBOT_EMAIL: 'admin@orbitup.io' };

        try {
            console.log(`[DOMAIN PROVISION] 🚀 Iniciando provisionamento para: ${sanitizedDomain}:${sanitizedPort}`);

            const { stdout, stderr } = await execAsync(
                `bash "${PROVISION_SCRIPT}" "${sanitizedDomain}" "${sanitizedPort}"`,
                { env, timeout: 120_000 } // certbot can take up to 2 min
            );

            const output = [stdout.trim(), stderr?.trim()].filter(Boolean).join('\n');
            console.log(`[DOMAIN PROVISION] ✅ ${sanitizedDomain} provisionado:\n${output}`);
            return { success: true, output };

        } catch (err: any) {
            const exitCode: number | undefined = err.code;
            const errMsg = err.stderr?.trim() || err.message || 'Unknown error';
            console.error(`[DOMAIN PROVISION] ❌ Falha ao provisionar ${sanitizedDomain} (exit ${exitCode}): ${errMsg}`);
            return { success: false, error: errMsg, exitCode };
        }
    }

    /**
     * Removes an nginx site config for a deprovisioned custom domain.
     */
    static async deprovision(domain: string): Promise<ProvisionResult> {
        if (!VALID_DOMAIN_RE.test(domain)) {
            return { success: false, error: `Invalid domain format: ${domain}` };
        }

        const sanitizedDomain = domain.toLowerCase().trim();

        try {
            const cmds = [
                `rm -f /etc/nginx/sites-enabled/${sanitizedDomain}`,
                `rm -f /etc/nginx/sites-available/${sanitizedDomain}`,
                `nginx -s reload`,
            ].join(' && ');

            const { stdout } = await execAsync(cmds, { timeout: 30_000 });
            console.log(`[DOMAIN PROVISION] 🗑 ${sanitizedDomain} removido`);
            return { success: true, output: stdout.trim() };

        } catch (err: any) {
            const errMsg = err.stderr?.trim() || err.message;
            console.error(`[DOMAIN PROVISION] ❌ Falha ao remover ${sanitizedDomain}: ${errMsg}`);
            return { success: false, error: errMsg };
        }
    }
}
