'use client';

import { toast } from "sonner";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Building2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useOrganizations } from "@/lib/hooks";
import { Organization } from "@/types";
import { useActiveOrg } from "@/lib/use-org-store";
import { CreateOrgModal } from "../modals/create-org-modal";

const planColors: Record<string, string> = {
    MAX: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    ENTERPRISE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    PRO: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    FREE: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export function OrgSwitcher() {
    const { data: orgs = [], isLoading } = useOrganizations();
    const { activeOrgId, setActiveOrgId } = useActiveOrg();

    const [open, setOpen] = useState(false);
    const [showCreateOrg, setShowCreateOrg] = useState(false);

    const selected = orgs.find(o => o.id === activeOrgId) || orgs[0];

    // Pick first org as default on load if nothing in store
    useEffect(() => {
        if (orgs.length > 0 && !activeOrgId) {
            setActiveOrgId(orgs[0].id);
        }
    }, [orgs, activeOrgId, setActiveOrgId]);

    if (!selected && !isLoading) return null;

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[200px] justify-between h-9 px-3 text-sm font-medium border-border bg-secondary/30 hover:bg-secondary/60"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span className="text-xs text-muted-foreground">Sincronizando...</span>
                            </div>
                        ) : selected ? (
                            <span className="flex items-center gap-2 truncate">
                                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                                    {selected.name[0]}
                                </div>
                                <span className="truncate">{selected.name}</span>
                            </span>
                        ) : (
                            <span className="text-muted-foreground text-xs">Sem Workspaces</span>
                        )}
                        <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0" align="start">
                    <Command className="bg-card">
                        <CommandInput placeholder="Buscar organização..." className="h-9" />
                        <CommandList>
                            <CommandEmpty>Nenhuma organização encontrada.</CommandEmpty>
                            <CommandGroup heading="Suas organizações">
                                {orgs.map((org) => (
                                    <CommandItem
                                        key={org.id}
                                        onSelect={() => {
                                            setActiveOrgId(org.id);
                                            setOpen(false);
                                        }}
                                        className="flex items-center justify-between gap-2 cursor-pointer"
                                    >
                                        <span className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                                                {org.name[0]}
                                            </div>
                                            <span className="truncate text-sm">{org.name}</span>
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 font-bold uppercase", planColors[org.plan])}>
                                                {org.plan === "ENTERPRISE" ? "ENT" : org.plan}
                                            </Badge>
                                            {selected?.id === org.id && (
                                                <Check className="h-3.5 w-3.5 text-violet-400" />
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandGroup>
                                <CommandItem
                                    className="cursor-pointer gap-2 text-muted-foreground hover:text-foreground"
                                    onSelect={() => {
                                        setOpen(false);
                                        setShowCreateOrg(true);
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                    Nova Organização
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <CreateOrgModal
                open={showCreateOrg}
                onClose={() => setShowCreateOrg(false)}
            />
        </>
    );
}
