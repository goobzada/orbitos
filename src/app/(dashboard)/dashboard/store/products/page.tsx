"use client";

import { useState } from "react";
import { useOrganizations, useStoreProducts, useCreateStoreProduct, useDeleteStoreProduct, useUpdateStoreProduct } from "@/lib/hooks";
import { Plus, Tag, Search, Box, MoreVertical, Trash2, Edit2, Globe, Sparkles, CreditCard, Rocket, ShieldCheck, Zap, Server } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useActiveOrg } from "@/lib/use-org-store";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/components/providers/language-provider";

export default function StoreProductsPage() {
    const { t } = useTranslation();
    const { activeOrgId } = useActiveOrg();
    const { data: orgs } = useOrganizations();
    const org = orgs?.find(o => o.id === activeOrgId);
    const isFree = org?.plan === 'FREE';

    const { data: products, isLoading } = useStoreProducts(activeOrgId || "");
    const createProduct = useCreateStoreProduct(activeOrgId || "");
    const deleteProduct = useDeleteStoreProduct(activeOrgId || "");
    const updateProduct = useUpdateStoreProduct(activeOrgId || "");

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const openEdit = (product: any) => {
        setEditingProduct({
            id: product.id,
            name: product.name,
            slug: product.slug || '',
            description: product.description || '',
            thumbnailUrl: product.thumbnailUrl || '',
            priceCents: product.priceCents / 100,
            billingCycle: product.billingCycle || 'ONE_TIME',
            deliveryType: product.deliveryType || 'MANUAL',
            category: product.category || '',
            status: product.status || 'ACTIVE',
        });
        setIsEditOpen(true);
    };

    const handleEdit = async () => {
        if (!editingProduct) return;
        try {
            await updateProduct.mutateAsync({
                productId: editingProduct.id,
                data: {
                    ...editingProduct,
                    priceCents: Number(editingProduct.priceCents) * 100,
                },
            });
            toast.success(t.common.success);
            setIsEditOpen(false);
            setEditingProduct(null);
        } catch {
            toast.error(t.common.error);
        }
    };

    // New Product State
    const [newProduct, setNewProduct] = useState({
        name: "",
        slug: "",
        description: "",
        thumbnailUrl: "",
        priceCents: 0,
        billingCycle: "ONE_TIME",
        deliveryType: "MANUAL",
        category: "",
        status: "ACTIVE"
    });

    const handleCreate = async () => {
        try {
            await createProduct.mutateAsync({
                ...newProduct,
                priceCents: Number(newProduct.priceCents) * 100 // Convert to cents
            });
            toast.success(t.common.success);
            setIsCreateOpen(false);
            setNewProduct({
                name: "",
                slug: "",
                description: "",
                thumbnailUrl: "",
                priceCents: 0,
                billingCycle: "ONE_TIME",
                deliveryType: "MANUAL",
                category: "",
                status: "ACTIVE"
            });
        } catch (err) {
            toast.error(t.common.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t.common.delete + "?")) return;
        try {
            await deleteProduct.mutateAsync(id);
            toast.success(t.common.success);
        } catch (err) {
            toast.error(t.common.error);
        }
    };

    const filteredProducts = products?.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (isFree) {
        return (
            <div className="max-w-6xl mx-auto space-y-8 fade-in pb-12">
                <div className="p-12 rounded-3xl border border-border bg-card/50 backdrop-blur-xl shadow-2xl text-center flex flex-col items-center justify-center space-y-6">
                    <div className="w-20 h-20 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                        <ShieldCheck className="w-10 h-10 text-violet-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold tracking-tight">{t.store.exclusive_feature}</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            {t.store.exclusive_desc}
                        </p>
                    </div>
                    <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-violet-500/20">
                        {t.billing.upgrade_cta}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="max-w-7xl mx-auto space-y-8 fade-in pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-violet-500 font-semibold text-sm uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" />
                        Store Engine v2
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">{t.store.inventory_title}</h1>
                    <p className="text-muted-foreground">
                        {t.store.inventory_desc}
                    </p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-violet-600 hover:bg-violet-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-violet-500/25 flex items-center gap-2 group transition-all">
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            {t.store.new_product}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] border-border bg-card/95 backdrop-blur-xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <Box className="w-6 h-6 text-violet-500" />
                                {t.store.create_product_title}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">{t.store.product_name}</Label>
                                    <Input
                                        placeholder="Ex: VIP Diamante"
                                        className="bg-background/50 border-border"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">{t.store.product_slug}</Label>
                                    <Input
                                        placeholder="vip-diamante"
                                        className="bg-background/50 border-border"
                                        value={newProduct.slug}
                                        onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">{t.store.base_price}</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            placeholder="29.90"
                                            className="pl-9 bg-background/50 border-border"
                                            value={newProduct.priceCents || ""}
                                            onChange={(e) => setNewProduct({ ...newProduct, priceCents: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">{t.store.billing_cycle}</Label>
                                    <Select
                                        value={newProduct.billingCycle}
                                        onValueChange={(val) => setNewProduct({ ...newProduct, billingCycle: val })}
                                    >
                                        <SelectTrigger className="bg-background/50 border-border">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ONE_TIME">{t.store.one_time}</SelectItem>
                                            <SelectItem value="MONTHLY">{t.store.monthly}</SelectItem>
                                            <SelectItem value="YEARLY">{t.store.yearly}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">{t.store.delivery_driver}</Label>
                                    <Select
                                        value={newProduct.deliveryType}
                                        onValueChange={(val) => setNewProduct({ ...newProduct, deliveryType: val })}
                                    >
                                        <SelectTrigger className="bg-background/50 border-border">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MANUAL">Entrega Manual</SelectItem>
                                            <SelectItem value="DISCORD_ROLE">Discord Role (Auto)</SelectItem>
                                            <SelectItem value="MINECRAFT_COMMAND">MC Command (Auto)</SelectItem>
                                            <SelectItem value="FIVEM_EVENT">FiveM Event (Auto)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">{t.common.category}</Label>
                                    <Input
                                        placeholder="Ex: Ranks"
                                        className="bg-background/50 border-border"
                                        value={newProduct.category}
                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">URL da Imagem (Thumbnail)</Label>
                                <Input
                                    placeholder="https://exemplo.com/imagem.png"
                                    className="bg-background/50 border-border"
                                    value={newProduct.thumbnailUrl}
                                    onChange={(e) => setNewProduct({ ...newProduct, thumbnailUrl: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">Descrição</Label>
                                <textarea
                                    placeholder="Descreva o produto..."
                                    rows={3}
                                    className="w-full rounded-md bg-background/50 border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl border-border">{t.common.cancel}</Button>
                            <Button
                                onClick={handleCreate}
                                disabled={createProduct.isPending}
                                className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 rounded-xl"
                            >
                                {createProduct.isPending ? t.common.loading : t.store.save_product}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filter and Content */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 bg-card/40 border border-border/50 p-2 rounded-2xl backdrop-blur-sm max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder={`${t.common.search}...`}
                            className="pl-9 bg-transparent border-none focus-visible:ring-0 shadow-none h-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 rounded-3xl bg-card/50 border border-border animate-pulse" />
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="p-20 rounded-[2.5rem] border border-dashed border-border/60 bg-card/30 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center">
                            <Tag className="w-8 h-8 text-muted-foreground/60" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">{t.store.no_products}</h3>
                            <p className="text-muted-foreground max-w-sm">{t.store.add_first_product}</p>
                        </div>
                        <Button variant="outline" onClick={() => setIsCreateOpen(true)} className="rounded-xl border-border font-bold gap-2">
                            <Plus className="w-4 h-4" /> {t.store.new_product}
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map((product) => (
                            <Card key={product.id} className="group overflow-hidden rounded-[2rem] border-border bg-card/50 hover:bg-card hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300">
                                <div className="h-48 bg-muted/40 relative overflow-hidden flex items-center justify-center">
                                    {product.thumbnailUrl ? (
                                        <img src={product.thumbnailUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground/40">
                                            <Box className="w-12 h-12" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Sem Imagem</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <Badge className="bg-background/80 backdrop-blur-md border-border text-foreground rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-sm">
                                            {product.billingCycle === 'ONE_TIME' ? <Zap className="w-3 h-3 text-amber-500" /> : <Rocket className="w-3 h-3 text-violet-500" />}
                                            {product.billingCycle === 'ONE_TIME' ? t.store.one_time : t.store.monthly}
                                        </Badge>
                                        <Badge className="bg-background/80 backdrop-blur-md border-border text-foreground rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-sm">
                                            {product.deliveryType === 'MANUAL' ? <Edit2 className="w-3 h-3 text-muted-foreground" /> : <Server className="w-3 h-3 text-emerald-500" />}
                                            {product.deliveryType === 'MANUAL' ? t.store.manual_delivery : t.store.auto_delivery}
                                        </Badge>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="secondary" className="absolute top-4 right-4 h-8 w-8 rounded-full bg-background/80 backdrop-blur-md border-none opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-md border-border rounded-xl">
                                            <DropdownMenuItem onClick={() => openEdit(product)} className="gap-2 cursor-pointer">
                                                <Edit2 className="w-4 h-4" /> {t.common.edit}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(product.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                                                <Trash2 className="w-4 h-4" /> {t.common.delete}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase text-violet-500 tracking-widest">{product.category || "Geral"}</span>
                                            <span className="text-xl font-black text-foreground">
                                                {(product.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold line-clamp-1">{product.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                                            {product.description || "Nenhuma descrição fornecida."}
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="px-6 pb-6 pt-0">
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-2xl bg-violet-600/5 border-violet-500/10 hover:bg-violet-600/10 text-violet-500 font-bold gap-2"
                                        onClick={() => window.open(`/s/${org?.slug}/store`, '_blank')}
                                    >
                                        <Globe className="w-4 h-4" /> {t.store.view_in_store}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}  
            </div>
        </div>

        {/* Edit Product Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="sm:max-w-[600px] border-border bg-card/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Edit2 className="w-6 h-6 text-violet-500" />
                        {t.common.edit} Produto
                    </DialogTitle>
                </DialogHeader>
                {editingProduct && (
                    <div className="grid gap-6 py-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">{t.store.product_name}</Label>
                                <Input
                                    placeholder="Ex: VIP Diamante"
                                    className="bg-background/50 border-border"
                                    value={editingProduct.name}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">{t.store.product_slug}</Label>
                                <Input
                                    placeholder="vip-diamante"
                                    className="bg-background/50 border-border"
                                    value={editingProduct.slug}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">{t.store.base_price}</Label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        placeholder="29.90"
                                        className="pl-9 bg-background/50 border-border"
                                        value={editingProduct.priceCents || ""}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, priceCents: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">{t.store.billing_cycle}</Label>
                                <Select
                                    value={editingProduct.billingCycle}
                                    onValueChange={(val) => setEditingProduct({ ...editingProduct, billingCycle: val })}
                                >
                                    <SelectTrigger className="bg-background/50 border-border"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ONE_TIME">{t.store.one_time}</SelectItem>
                                        <SelectItem value="MONTHLY">{t.store.monthly}</SelectItem>
                                        <SelectItem value="YEARLY">{t.store.yearly}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">{t.store.delivery_driver}</Label>
                                <Select
                                    value={editingProduct.deliveryType}
                                    onValueChange={(val) => setEditingProduct({ ...editingProduct, deliveryType: val })}
                                >
                                    <SelectTrigger className="bg-background/50 border-border"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MANUAL">Entrega Manual</SelectItem>
                                        <SelectItem value="DISCORD_ROLE">Discord Role (Auto)</SelectItem>
                                        <SelectItem value="MINECRAFT_COMMAND">MC Command (Auto)</SelectItem>
                                        <SelectItem value="FIVEM_EVENT">FiveM Event (Auto)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">{t.common.category}</Label>
                                <Input
                                    placeholder="Ex: Ranks"
                                    className="bg-background/50 border-border"
                                    value={editingProduct.category}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">URL da Imagem (Thumbnail)</Label>
                            <Input
                                placeholder="https://exemplo.com/imagem.png"
                                className="bg-background/50 border-border"
                                value={editingProduct.thumbnailUrl}
                                onChange={(e) => setEditingProduct({ ...editingProduct, thumbnailUrl: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-muted-foreground tracking-tighter">Descrição</Label>
                            <textarea
                                placeholder="Descreva o produto..."
                                rows={3}
                                className="w-full rounded-md bg-background/50 border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                value={editingProduct.description}
                                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                            />
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl border-border">{t.common.cancel}</Button>
                    <Button
                        onClick={handleEdit}
                        disabled={updateProduct.isPending}
                        className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 rounded-xl"
                    >
                        {updateProduct.isPending ? t.common.loading : t.common.save}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
}

