'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useOrganizations } from '@/lib/hooks';
import { getI18n, Language } from '@/lib/i18n';

interface LanguageContextType {
    lang: Language;
    t: any;
    setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { data: orgs } = useOrganizations();
    const [lang, setLang] = useState<Language>('pt-BR');

    useEffect(() => {
        if (orgs && orgs.length > 0) {
            const activeOrg = orgs[0]; // Simplificação: pega a primeira por enquanto
            if (activeOrg.language) {
                setLang(activeOrg.language as Language);
            }
        }
    }, [orgs]);

    const t = getI18n(lang);

    return (
        <LanguageContext.Provider value={{ lang, t, setLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
}
