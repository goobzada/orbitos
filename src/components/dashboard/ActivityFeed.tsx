'use client';

import { motion } from "framer-motion";
import {
    Activity,
    Server,
    UserPlus,
    Settings,
    ShieldCheck,
    AlertCircle,
    BadgeCheck,
    Users,
    Key,
    ShoppingBag,
    Code,
    Building2 as Organization
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Activity {
    id: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    userId?: string;
    organizationId?: string;
    metadata?: string | any;
    createdAt: string;
}

interface ActivityFeedProps {
    activities: Activity[];
}

const actionIcons: Record<string, any> = {
    'SERVER_CREATED': { icon: Server, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    'STAFF_ADDED': { icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    'IDENTITY_UPDATED': { icon: BadgeCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    'ORGANIZATION_CREATED': { icon: Organization, color: 'text-primary', bg: 'bg-primary/10' },
    'POLICY_MODIFIED': { icon: ShieldCheck, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    'KEY_ROTATED': { icon: Key, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    'USER_ROLE_UPDATED': { icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    'STORE_PRODUCT_CREATED': { icon: ShoppingBag, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    'SSH_ACTION': { icon: Code, color: 'text-primary', bg: 'bg-primary/10' },
    'RCON_ACTION': { icon: Code, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    'DEFAULT': { icon: Activity, color: 'text-muted-foreground', bg: 'bg-muted/10' }
};

const getSeverity = (action: string) => {
    if (action.includes('REMOVED') || action.includes('DELETED') || action.includes('FAILED')) return 'destructive';
    if (action.includes('CREATED') || action.includes('ADDED') || action.includes('SUCCESS')) return 'secondary';
    return 'outline';
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
    return (
        <div className="space-y-4">
            {activities.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-border/5 rounded-2xl">
                    <p className="text-xs text-muted-foreground italic">Nenhuma atividade registrada no log recente.</p>
                </div>
            ) : activities.map((activity, idx) => {
                const config = actionIcons[activity.action] || actionIcons['DEFAULT'];
                const Icon = config.icon;
                const date = new Date(activity.createdAt);

                return (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="group flex items-start gap-4 p-3 rounded-xl hover:bg-muted/30 transition-all border border-transparent hover:border-border/10 cursor-default"
                    >
                        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0 shadow-lg shadow-black/5`}>
                            <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>

                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-black tracking-tight uppercase">{activity.action.replace(/_/g, ' ')}</p>
                                <span className="text-[10px] text-muted-foreground italic font-medium">
                                    {formatRelative(date, new Date(), { locale: ptBR })}
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-medium">
                                {activity.resourceType} {activity.resourceId?.slice(0, 8)} modificado por {activity.userId?.slice(0, 8) || 'System'}
                            </p>
                            <div className="flex items-center gap-2 pt-1.5 overflow-hidden">
                                <Badge variant={getSeverity(activity.action) as any} className="text-[9px] font-black tracking-widest px-1.5 py-0">
                                    TRACE_ID_{activity.id.slice(0, 6)}
                                </Badge>
                                {activity.organizationId && (
                                    <Badge variant="outline" className="text-[9px] font-black border-primary/20 text-primary px-1.5 py-0">
                                        TENANT_{activity.organizationId.slice(0, 4)}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
