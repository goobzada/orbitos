'use client';

import { useState } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useCreateOrganization } from "@/lib/hooks";
import { useTranslation } from "@/components/providers/language-provider";

interface CreateOrgModalProps {
    open: boolean;
    onClose: () => void;
}

export function CreateOrgModal({ open, onClose }: CreateOrgModalProps) {
    const { t } = useTranslation();
    const createOrg = useCreateOrganization();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [communityType, setCommunityType] = useState("general");
    const [error, setError] = useState("");

    const COMMUNITY_TYPES = [
        { value: 'game', label: t.dashboard.create_org.types.game },
        { value: 'music', label: t.dashboard.create_org.types.music },
        { value: 'study', label: t.dashboard.create_org.types.study },
        { value: 'business', label: t.dashboard.create_org.types.business },
        { value: 'creator', label: t.dashboard.create_org.types.creator },
        { value: 'dev', label: t.dashboard.create_org.types.dev },
        { value: 'general', label: t.dashboard.create_org.types.general },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError(t.dashboard.create_org.name_required);
            return;
        }

        setError("");
        setLoading(true);
        try {
            await createOrg.mutateAsync({ name, communityType });
            toast.success(t.dashboard.create_org.success);
            setName("");
            setCommunityType("general");
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.error || t.dashboard.create_org.error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-primary" />
                        {t.dashboard.create_org.title}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>{t.dashboard.create_org.name_label}</Label>
                        <Input
                            placeholder={t.dashboard.create_org.name_placeholder}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                        />
                        <p className="text-xs text-muted-foreground">
                            {t.dashboard.create_org.name_help}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>{t.dashboard.create_org.type_label}</Label>
                        <Select value={communityType} onValueChange={setCommunityType}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t.dashboard.create_org.type_placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                                {COMMUNITY_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {t.dashboard.create_org.type_help}
                        </p>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            {t.dashboard.create_org.cancel}
                        </Button>
                        <Button type="submit" disabled={loading} className="gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? t.dashboard.create_org.creating : t.dashboard.create_org.button}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
