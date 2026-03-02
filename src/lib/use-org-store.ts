'use client';

import { useState, useEffect } from 'react';
import { Organization } from '@/types';

// Simple global state for browser
let activeOrgId: string | null = typeof window !== 'undefined' ? localStorage.getItem('orbitos_active_org') : null;
const listeners = new Set<(id: string | null) => void>();

export const useActiveOrg = () => {
    const [orgId, setOrgId] = useState<string | null>(activeOrgId);

    useEffect(() => {
        const handleUpdate = (id: string | null) => setOrgId(id);
        listeners.add(handleUpdate);
        return () => {
            listeners.delete(handleUpdate);
        };
    }, []);

    const setActiveOrgId = (id: string | null) => {
        activeOrgId = id;
        if (typeof window !== 'undefined') {
            if (id) localStorage.setItem('orbitos_active_org', id);
            else localStorage.removeItem('orbitos_active_org');
        }
        listeners.forEach(l => l(id));
    };

    return { activeOrgId: orgId, setActiveOrgId };
};
