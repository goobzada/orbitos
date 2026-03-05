'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useOrganizations } from '@/lib/hooks';
import { getI18n, Language } from '@/lib/i18n';

const LANG_STORAGE_KEY = 'orbitos_lang';
const DEFAULT_LANG: Language = 'pt-BR';

interface LanguageContextType {
    lang: Language;
    t: any;
    setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Lê o idioma do localStorage de forma síncrona na inicialização,
// evitando o flash de idioma errado no primeiro render.
function getInitialLang(): Language {
    if (typeof window === 'undefined') return DEFAULT_LANG;
    const stored = localStorage.getItem(LANG_STORAGE_KEY) as Language | null;
    return stored || DEFAULT_LANG;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { data: orgs } = useOrganizations();
    const [lang, setLangState] = useState<Language>(getInitialLang);

    const setLang = (newLang: Language) => {
        setLangState(newLang);
        if (typeof window !== 'undefined') {
            localStorage.setItem(LANG_STORAGE_KEY, newLang);
        }
    };

    useEffect(() => {
        if (orgs && orgs.length > 0) {
            const activeOrgId = typeof window !== 'undefined' ? localStorage.getItem('activeOrganizationId') : null;
            const activeOrg = orgs.find(o => o.id === activeOrgId) || orgs[0];

            if (activeOrg?.language && activeOrg.language !== lang) {
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
