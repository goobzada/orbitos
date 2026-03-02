import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import api from './api';
import { Server, Ticket, User, StaffMember, Organization } from '@/types';

// ─── Auth ──────────────────────────────────────────────

export const useMe = () => {
    return useQuery<User>({
        queryKey: ['me'],
        queryFn: async () => {
            const { data } = await api.get('/auth/me');
            return data;
        },
        retry: false,          // não retenta: se der 401, é sessão inválida mesmo
        staleTime: 5 * 60_000, // considera fresh por 5 min
    });
};

// ─── Organizations ───────────────────────────────────────

export const useOrganizations = () => {
    return useQuery<Organization[]>({
        queryKey: ['organizations'],
        queryFn: async () => {
            const { data } = await api.get('/organizations/me');
            return data;
        },
    });
};

export const useCreateOrganization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { name: string; communityType?: string }) => {
            const { data: res } = await api.post('/organizations', data);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
        },
    });
};

export const useUpdateOrganization = (organizationId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { name?: string; slug?: string; subdomain?: string; customDomain?: string; language?: string }) => {
            const { data: res } = await api.patch(`/organizations/${organizationId}`, data);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
        },
    });
};

// ─── Servers ───────────────────────────────────────────

export const useServers = () => {
    return useQuery<Server[]>({
        queryKey: ['servers'],
        queryFn: async () => {
            const { data } = await api.get('/servers');
            return data;
        },
    });
};

export const useServer = (serverId: string) => {
    return useQuery<Server>({
        queryKey: ['servers', serverId],
        queryFn: async () => {
            const { data } = await api.get(`/servers/${serverId}`);
            return data;
        },
        enabled: !!serverId,
    });
};

// ─── Orbit Agent Status ─────────────────────────────────

export interface AgentStatusData {
    online: boolean;
    count: number;
    agents: string[]; // lista de serverIds conectados
    ts: string;
}

export const useAgentStatus = () => {
    return useQuery<AgentStatusData>({
        queryKey: ['agents-status'],
        queryFn: async () => {
            const { data } = await api.get('/agents/status');
            return data;
        },
        refetchInterval: 15_000, // Atualiza a cada 15 segundos
        staleTime: 10_000,
        retry: false, // Não alerta em ambientes sem agent
    });
};

// ─── Tickets ───────────────────────────────────────────

export const useTickets = (serverId?: string) => {
    return useQuery<Ticket[]>({
        queryKey: ['tickets', serverId],
        queryFn: async () => {
            const params = serverId ? `?serverId=${serverId}` : '';
            const { data } = await api.get(`/tickets${params}`);
            return data;
        },
    });
};

export const useCloseTicket = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ticketId: string) => {
            const { data } = await api.patch(`/tickets/${ticketId}/close`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
};

export const useDeleteTicket = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ticketId: string) => {
            const { data } = await api.delete(`/tickets/${ticketId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
};

export const useTicket = (ticketId: string) => {
    return useQuery<Ticket>({
        queryKey: ['tickets', ticketId],
        queryFn: async () => {
            const { data } = await api.get(`/tickets/${ticketId}`);
            return data;
        },
        enabled: !!ticketId,
        refetchInterval: 3000,
    });
};

export const useSendTicketMessage = (ticketId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (content: string) => {
            const { data } = await api.post(`/tickets/${ticketId}/messages`, { content });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets', ticketId] });
        },
    });
};

export const useUpdateTicketStatus = (ticketId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (status: string) => {
            const { data } = await api.patch(`/tickets/${ticketId}/status`, { status });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets', ticketId] });
        },
    });
};

export const useUpdateTicketPriority = (ticketId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (priority: string) => {
            const { data } = await api.patch(`/tickets/${ticketId}/priority`, { priority });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets', ticketId] });
        },
    });
};

export const useAssignTicketStaff = (ticketId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (staffId: string | null) => {
            const { data } = await api.patch(`/tickets/${ticketId}/assign`, { staffId });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets', ticketId] });
        },
    });
};

// ─── Analytics ─────────────────────────────────────────

export const useAnalytics = (period: '7d' | '30d' | '90d' = '30d') => {
    return useQuery({
        queryKey: ['analytics', period],
        queryFn: async () => {
            const { data } = await api.get(`/analytics?period=${period}`);
            return data;
        },
    });
};

// ─── Stats Overview ────────────────────────────────────

export const useOverviewStats = () => {
    return useQuery({
        queryKey: ['overview-stats'],
        queryFn: async () => {
            const { data } = await api.get('/stats/overview');
            return data;
        },
        refetchInterval: 60_000,
        retry: false,           // falha silenciosa, não dispara logout
        staleTime: 30_000,
    });
};

export const useRecentActivity = (limit = 10) => {
    return useQuery<any[]>({
        queryKey: ['recent-activity', limit],
        queryFn: async () => {
            const { data } = await api.get(`/stats/audit/recent?limit=${limit}`);
            return data;
        },
        refetchInterval: 30_000,
        retry: false,           // falha silenciosa, não dispara logout
        staleTime: 15_000,
    });
};

// useApiHealth usa um cliente axios SEM interceptor de auth
// para garantir que nunca cause logout mesmo se o backend retornar 401
const healthClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    timeout: 5_000,
});

export const useApiHealth = () => {
    return useQuery({
        queryKey: ['api-health'],
        queryFn: async () => {
            const { data } = await healthClient.get('/health');
            return data;
        },
        refetchInterval: 15_000, // a cada 15s (era 10s)
        retry: false,
        staleTime: 10_000,
    });
};

export const useAddServer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { organizationId: string; discordGuildId: string; name: string }) => {
            const { data: res } = await api.post('/servers', data);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['servers'] });
            queryClient.invalidateQueries({ queryKey: ['overview-stats'] });
        },
    });
};

export const useDeleteServer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (serverId: string) => {
            const { data } = await api.delete(`/servers/${serverId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['servers'] });
            queryClient.invalidateQueries({ queryKey: ['overview-stats'] });
        },
    });
};

export const useUpdateServerConfig = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ serverId, config }: { serverId: string; config: any }) => {
            const { data } = await api.patch(`/servers/${serverId}/config`, config);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['servers'] });
        },
    });
};

// ─── Staff ─────────────────────────────────────────────

export const useStaffMembers = (serverId?: string) => {
    return useQuery<StaffMember[]>({
        queryKey: ['staff', serverId],
        queryFn: async () => {
            const params = serverId ? `?serverId=${serverId}` : '';
            const { data } = await api.get(`/staff${params}`);
            return data;
        },
    });
};

export const useAddStaffMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { serverId: string; discordUserId: string; username: string; role: string }) => {
            const { data: res } = await api.post('/staff', data);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
        },
    });
};

export const useRemoveStaffMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (staffId: string) => {
            const { data } = await api.delete(`/staff/${staffId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
        },
    });
};

export const useUpdateStaffMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ staffId, role }: { staffId: string; role: string }) => {
            const { data } = await api.patch(`/staff/${staffId}`, { role });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff'] });
        },
    });
};

// ─── Templates / Identity ──────────────────────────────

export const useIdentity = (orgId: string) => {
    return useQuery({
        queryKey: ['identity', orgId],
        queryFn: async () => {
            const { data } = await api.get(`/templates/identity/${orgId}`);
            return data;
        },
        enabled: !!orgId,
    });
};

export const useUpdateIdentity = (orgId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await api.put(`/templates/identity/${orgId}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['identity', orgId] });
        },
    });
};

// ─── Platform / Super Admin ───────────────────────────

export const usePlatformOrganizations = () => {
    return useQuery<any[]>({
        queryKey: ['platform-organizations'],
        queryFn: async () => {
            const { data } = await api.get('/platform/organizations');
            return data;
        },
    });
};

export const usePlatformOverview = () => {
    return useQuery({
        queryKey: ['platform-overview'],
        queryFn: async () => {
            const { data } = await api.get('/platform/overview');
            return data;
        },
    });
};

export const usePlatformPayments = () => {
    return useQuery<any[]>({
        queryKey: ['platform-payments'],
        queryFn: async () => {
            const { data } = await api.get('/platform/billing');
            return data;
        },
    });
};

export const usePlatformAutomations = () => {
    return useQuery<any[]>({
        queryKey: ['platform-automations'],
        queryFn: async () => {
            const { data } = await api.get('/platform/automations');
            return data;
        },
    });
};

export const usePlatformAutomationLogs = () => {
    return useQuery<any[]>({
        queryKey: ['platform-automation-logs'],
        queryFn: async () => {
            const { data } = await api.get('/platform/automations/logs');
            return data;
        },
    });
};

export const useTogglePlatformAutomation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.patch(`/platform/automations/${id}/toggle`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-automations'] });
        },
    });
};

export const usePlatformInfra = () => {
    return useQuery<any[]>({
        queryKey: ['platform-infra'],
        queryFn: async () => {
            const { data } = await api.get('/platform/infrastructure');
            return data;
        },
    });
};

export const usePlatformInfraErrors = () => {
    return useQuery<any[]>({
        queryKey: ['platform-infra-errors'],
        queryFn: async () => {
            const { data } = await api.get('/platform/infrastructure/errors');
            return data;
        },
    });
};

export const useReconnectDriver = () => {
    return useMutation({
        mutationFn: async (driver: string) => {
            const { data } = await api.post(`/platform/infrastructure/reconnect/${driver}`);
            return data;
        },
    });
};

export const useFeatureFlags = () => {
    return useQuery<any[]>({
        queryKey: ['feature-flags'],
        queryFn: async () => {
            const { data } = await api.get('/platform/feature-flags');
            return data;
        },
    });
};

export const useToggleFeatureFlag = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.patch(`/platform/feature-flags/${id}/toggle`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
        },
    });
};

export const useUpdatePlatformOrganization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { data: res } = await api.patch(`/platform/organizations/${id}`, data);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-organizations'] });
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
        },
    });
};

export const useOrgAnalytics = (organizationId: string) => {
    return useQuery<any>({
        queryKey: ['org-analytics', organizationId],
        queryFn: async () => {
            const { data } = await api.get(`/orgs/${organizationId}/analytics`);
            return data;
        },
        enabled: !!organizationId,
    });
};

export const useDeletePlatformOrganization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`/platform/organizations/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform-organizations'] });
        },
    });
};

export const useTicketTemplates = (organizationId: string) => {
    return useQuery<any[]>({
        queryKey: ['ticket-templates', organizationId],
        queryFn: async () => {
            const { data } = await api.get(`/orgs/${organizationId}/tickets/templates`);
            return data;
        },
        enabled: !!organizationId,
    });
};

export const useCreateTicketTemplate = (organizationId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const { data: res } = await api.post(`/orgs/${organizationId}/tickets/templates`, data);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket-templates', organizationId] });
        },
    });
};

export const useDeleteTicketTemplate = (organizationId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (templateId: string) => {
            const { data } = await api.delete(`/orgs/${organizationId}/tickets/templates/${templateId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket-templates', organizationId] });
        },
    });
};
// ─── Store Engine ───────────────────────────────────────

export const useStoreSettings = (organizationId: string) => {
    return useQuery<any>({
        queryKey: ['store-settings', organizationId],
        queryFn: async () => {
            const { data } = await api.get(`/store/settings?organizationId=${organizationId}`);
            return data;
        },
        enabled: !!organizationId,
    });
};

// ─── Support Access (PIN) ────────────────────────────────

export const useSupportSessions = (organizationId: string) => {
    return useQuery<any[]>({
        queryKey: ['support-sessions', organizationId],
        queryFn: async () => {
            const { data } = await api.get(`/support/orgs/${organizationId}/sessions`);
            return data;
        },
        enabled: !!organizationId,
    });
};

export const useGenerateSupportPin = (organizationId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { data } = await api.post(`/support/orgs/${organizationId}/pin`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support-sessions', organizationId] });
        },
    });
};

export const useRevokeSupportSession = (organizationId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (sessionId: string) => {
            const { data } = await api.delete(`/support/orgs/${organizationId}/sessions/${sessionId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support-sessions', organizationId] });
        },
    });
};

export const useUpdateStoreSettings = (organizationId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const { data: res } = await api.put(`/store/settings?organizationId=${organizationId}`, data);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['store-settings', organizationId] });
        },
    });
};

export const useStoreProducts = (organizationId: string) => {
    return useQuery<any[]>({
        queryKey: ['store-products', organizationId],
        queryFn: async () => {
            const { data } = await api.get(`/store/products?organizationId=${organizationId}`);
            return data;
        },
        enabled: !!organizationId,
    });
};

export const useCreateStoreProduct = (organizationId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            const { data: res } = await api.post(`/store/products?organizationId=${organizationId}`, data);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['store-products', organizationId] });
        },
    });
};

export const useUpdateStoreProduct = (organizationId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ productId, data }: { productId: string, data: any }) => {
            const { data: res } = await api.put(`/store/products/${productId}?organizationId=${organizationId}`, data);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['store-products', organizationId] });
        },
    });
};

export const useDeleteStoreProduct = (organizationId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (productId: string) => {
            const { data: res } = await api.delete(`/store/products/${productId}?organizationId=${organizationId}`);
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['store-products', organizationId] });
        },
    });
};

export const useStoreOrders = (organizationId: string) => {
    return useQuery<any[]>({
        queryKey: ['store-orders', organizationId],
        queryFn: async () => {
            const { data } = await api.get(`/store/orders?organizationId=${organizationId}`);
            return data;
        },
        enabled: !!organizationId,
    });
};

export const useCheckout = (organizationId: string) => {
    return useMutation({
        mutationFn: async (data: any) => {
            const { data: res } = await api.post(`/public/store/checkout?organizationId=${organizationId}`, data);
            return res;
        },
    });
};

// ─── Automations & Modules ─────────────────────────────

export const useModules = (organizationId: string) => {
    return useQuery<{
        communityType: string;
        plan: string;
        modules: any[];
    }>({
        queryKey: ['modules', organizationId],
        queryFn: async () => {
            const { data } = await api.get(`/organizations/${organizationId}/modules`);
            return data;
        },
        enabled: !!organizationId,
    });
};

export const useToggleModule = (organizationId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ moduleKey, active }: { moduleKey: string; active: boolean }) => {
            const { data } = await api.post(`/organizations/${organizationId}/modules/toggle`, {
                moduleKey,
                active,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modules', organizationId] });
        },
    });
};

export const useUpdateModuleConfig = (organizationId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ moduleKey, config }: { moduleKey: string; config: any }) => {
            const { data } = await api.post(`/organizations/${organizationId}/modules/config`, {
                moduleKey,
                config,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modules', organizationId] });
        },
    });
};

export const useResetModuleConfig = (organizationId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (moduleKey: string) => {
            const { data } = await api.post(`/organizations/${organizationId}/modules/reset-config`, {
                moduleKey,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['modules', organizationId] });
        },
    });
};
