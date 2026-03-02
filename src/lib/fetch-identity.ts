import { ThemeTokens } from '@/lib/theme';
import { buildTheme } from '@/lib/theme';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function fetchOrganizationIdentity(slug: string): Promise<ThemeTokens> {
    try {
        // 1. Resolve slug → organizationId  
        const slugRes = await fetch(`${API_URL}/organizations/by-slug/${slug}`);
        if (!slugRes.ok) throw new Error('Org not found');
        const { id: organizationId, plan } = await slugRes.json();

        // 2. Fetch identity + preset
        const identityRes = await fetch(`${API_URL}/templates/identity/${organizationId}`, {
            headers: { 'x-public-portal': 'true' }
        });

        if (!identityRes.ok) {
            // Sem identidade ainda → retorna default
            return buildTheme(null, null);
        }

        const { preset, identity } = await identityRes.json();
        return buildTheme(identity, preset);
    } catch {
        return buildTheme(null, null);
    }
}
