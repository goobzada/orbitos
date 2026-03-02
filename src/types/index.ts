// ─── Base Types ────────────────────────────────────────

export interface Organization {
    id: string;
    ownerId: string;
    name: string;
    slug?: string;
    subdomain?: string;
    customDomain?: string;
    plan: "FREE" | "PRO" | "ENTERPRISE" | "MAX";
    language?: "pt-BR" | "en-US" | "es-ES";
    avatar?: string;
    createdAt?: string;
    _count?: {
        servers?: number;
    };
}

export interface User {
    id: string;
    discordId: string;
    username: string;
    avatar?: string;
    email?: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'USER';
    organizations?: Organization[];
    createdAt: string;
}



// ─── Servers ───────────────────────────────────────────

export interface Server {
    id: string;
    discordGuildId: string; // Alinhado com backend (discordGuildId)
    name: string;
    icon?: string;
    ownerId: string;
    ownerName?: string;
    organizationId?: string;
    memberCount: number;
    isActive: boolean;
    plan: 'FREE' | 'PRO' | 'ENTERPRISE' | 'MAX';
    config?: string; // JSON string from backend
    lastSeenAt?: string | null;
    createdAt: string;
    updatedAt?: string;
}

// ─── Tickets ───────────────────────────────────────────

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'CLOSED' | 'Aberto' | 'Em Progresso' | 'Aguardando' | 'Fechado';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'CRITICAL' | 'Baixa' | 'Média' | 'Alta' | 'Urgente' | 'Crítica';

export interface Ticket {
    id: string;
    serverId: string;
    server?: any; // Full server object if included
    authorId: string;
    subject: string | null;
    status: TicketStatus | string;
    priority: TicketPriority | string;
    createdAt: string;
    updatedAt: string;
    closedAt?: string | null;
    channelId?: string | null;
    messages?: TicketMessage[];
    tags?: string[];
    assignedStaffId?: string | null;
    assignedStaff?: StaffMember | null;
    formData?: string | null; // JSON string com o motivo/formulário preenchido no Discord
}

export interface TicketMessage {
    id: string;
    ticketId: string;
    authorId: string;
    authorName: string | null;
    authorAvatar: string | null;
    authorType: string;
    content: string;
    isStaff: boolean;
    createdAt: string;
}

// ─── Staff ─────────────────────────────────────────────

export type StaffRole = 'OWNER' | 'ADMIN' | 'MOD' | 'HELPER';

export interface StaffMember {
    id: string;
    userId?: string;
    discordId: string;
    serverId: string;
    username: string;
    avatar?: string;
    role: StaffRole;
    joinedAt: string;
    lastActive: string;
    ticketsResolved: number;
    punishments: number;
    avgResponseTime: string;
}

// ─── Analytics ─────────────────────────────────────────

export interface AnalyticsDataPoint {
    date: string;
    messages: number;
    servers: number;
    tickets: number;
    users: number;
}

export interface OverviewStats {
    activeServers: number;
    activeServersTrend: number;
    openTickets: number;
    openTicketsTrend: number;
    staffOnline: number;
    staffOnlineTrend: number;
    messagesLast24h: number;
    messagesLast24hTrend: number;
}

// ─── API Responses ─────────────────────────────────────

export interface ApiError {
    statusCode: number;
    message: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
