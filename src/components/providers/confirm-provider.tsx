'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ConfirmVariant = 'danger' | 'warning' | 'success' | 'info';

interface ConfirmOptions {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: ConfirmVariant;
}

interface ConfirmState extends ConfirmOptions {
    open: boolean;
    resolve: ((value: boolean) => void) | null;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

const variantConfig: Record<ConfirmVariant, {
    icon: React.ElementType;
    iconClass: string;
    iconBg: string;
    confirmClass: string;
}> = {
    danger: {
        icon: Trash2,
        iconClass: 'text-rose-400',
        iconBg: 'bg-rose-500/10',
        confirmClass: 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500',
    },
    warning: {
        icon: AlertTriangle,
        iconClass: 'text-amber-400',
        iconBg: 'bg-amber-500/10',
        confirmClass: 'bg-amber-600 hover:bg-amber-700 text-white border-amber-500',
    },
    success: {
        icon: CheckCircle2,
        iconClass: 'text-emerald-400',
        iconBg: 'bg-emerald-500/10',
        confirmClass: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500',
    },
    info: {
        icon: Info,
        iconClass: 'text-violet-400',
        iconBg: 'bg-violet-500/10',
        confirmClass: 'bg-violet-600 hover:bg-violet-700 text-white border-violet-500',
    },
};

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<ConfirmState>({
        open: false,
        title: '',
        description: '',
        confirmLabel: 'Confirmar',
        cancelLabel: 'Cancelar',
        variant: 'danger',
        resolve: null,
    });

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                open: true,
                title: options.title,
                description: options.description,
                confirmLabel: options.confirmLabel ?? 'Confirmar',
                cancelLabel: options.cancelLabel ?? 'Cancelar',
                variant: options.variant ?? 'danger',
                resolve,
            });
        });
    }, []);

    const handleClose = (result: boolean) => {
        state.resolve?.(result);
        setState(s => ({ ...s, open: false, resolve: null }));
    };

    const variant = state.variant ?? 'danger';
    const cfg = variantConfig[variant];
    const Icon = cfg.icon;

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <Dialog open={state.open} onOpenChange={(open) => { if (!open) handleClose(false); }}>
                <DialogContent
                    className="max-w-md bg-slate-950 border border-slate-800 shadow-2xl shadow-black/50"
                    showCloseButton={false}
                >
                    <DialogHeader>
                        <div className="flex items-start gap-4">
                            {/* Ícone */}
                            <div className={cn(
                                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                                cfg.iconBg
                            )}>
                                <Icon className={cn('w-5 h-5', cfg.iconClass)} />
                            </div>
                            {/* Texto */}
                            <div className="flex flex-col gap-1">
                                <DialogTitle className="text-base font-semibold text-foreground leading-tight">
                                    {state.title}
                                </DialogTitle>
                                {state.description && (
                                    <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                                        {state.description}
                                    </DialogDescription>
                                )}
                            </div>
                        </div>
                    </DialogHeader>

                    <DialogFooter className="mt-2 gap-2 sm:gap-2">
                        <Button
                            variant="outline"
                            className="flex-1 sm:flex-none border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-foreground"
                            onClick={() => handleClose(false)}
                        >
                            {state.cancelLabel}
                        </Button>
                        <Button
                            className={cn('flex-1 sm:flex-none border', cfg.confirmClass)}
                            onClick={() => handleClose(true)}
                        >
                            {state.confirmLabel}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
    return ctx.confirm;
}
