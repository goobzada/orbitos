'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useActiveOrg } from '@/lib/use-org-store';
import { toast } from 'sonner';

const SocketContext = createContext<WebSocket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { activeOrgId } = useActiveOrg();
    const queryClient = useQueryClient();
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !activeOrgId) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        // Tenta pegar o token do cookie se não tiver no localStorage (race condition)
        let resolvedToken = token;
        if (!resolvedToken) {
            const match = document.cookie.match(/(?:^|;)\s*token=([^;]*)/);
            if (match && match[1]) resolvedToken = decodeURIComponent(match[1]);
        }

        if (!resolvedToken) return;

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const wsUrl = baseUrl.replace('http', 'ws') + `/ws/dashboard?token=${resolvedToken}&orgId=${activeOrgId}`;

        console.log('[WS] Tentando conectar...', wsUrl.split('token=')[0] + 'token=***');

        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('[WS] Dashboard conectado à organização:', activeOrgId);
        };

        socket.onmessage = (event) => {
            try {
                const { type, payload } = JSON.parse(event.data);

                if (type === 'TICKET_CREATED') {
                    // Invalida lista de tickets
                    queryClient.invalidateQueries({ queryKey: ['tickets'] });
                    queryClient.invalidateQueries({ queryKey: ['overview-stats'] });

                    toast.success('Novo Ticket Aberto!', {
                        description: `Ticket #${payload.id.split('-')[0]} foi criado no servidor.`,
                        duration: 10000,
                        action: {
                            label: 'Abrir',
                            onClick: () => {
                                // Redireciona via window para garantir reload do estado se necessário
                                window.location.href = `/dashboard/tickets/${payload.id}`;
                            }
                        }
                    });

                    // Notificação sonora opcional
                    try {
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        audio.volume = 0.4;
                        audio.play();
                    } catch (e) {
                        // ignore error playing sound (browser block)
                    }
                }

                if (type === 'TICKET_UPDATED') {
                    // Invalida tanto a lista quanto o detalhe
                    queryClient.invalidateQueries({ queryKey: ['tickets'] });
                    queryClient.invalidateQueries({ queryKey: ['tickets', payload.id] });
                    queryClient.invalidateQueries({ queryKey: ['overview-stats'] });
                }
            } catch (err) {
                console.error('[WS] Erro ao processar mensagem:', err);
            }
        };

        socket.onclose = () => {
            console.warn('[WS] Dashboard desconectado do servidor.');
        };

        socket.onerror = (err) => {
            console.error('[WS] Erro na conexão WebSocket:', err);
        };

        return () => {
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                socket.close();
            }
        };
    }, [activeOrgId, queryClient]);

    return (
        <SocketContext.Provider value={socketRef.current}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);
