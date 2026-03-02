'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import type { ThemeTokens } from '@/lib/theme';

const ThemeContext = createContext<ThemeTokens | null>(null);

export function ThemeProvider({ value, children }: { value: ThemeTokens; children: ReactNode }) {
    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeTokens {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
    return ctx;
}
