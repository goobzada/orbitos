'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { LanguageProvider } from '../providers/language-provider';
import { SocketProvider } from '../providers/socket-provider';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <LanguageProvider>
                <SocketProvider>
                    {children}
                </SocketProvider>
            </LanguageProvider>
        </QueryClientProvider>
    );
}
