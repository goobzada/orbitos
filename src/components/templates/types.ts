export type LayoutType = "dashboard-sidebar" | "dashboard-topnav" | "marketing-landing" | "terminal" | "blocks" | "obsidian-empire" | "hologram-pro" | "cosmic-ultra";

export interface TemplateConfig {
    layoutType: LayoutType;
    heroMode: "small" | "full" | "none";
    navigation: "sidebar" | "topnav" | "none";
    cardShape: "rounded" | "square" | "glass" | "block" | "glass-intense";
    fontPreset: "default" | "minimal" | "modern" | "mono";
    backgroundPattern: "none" | "grid-neon" | "aurora" | "terminal" | "scanline" | "cosmos";
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    surfaceColor?: string;
    textColor?: string;
    navBackground?: string;
    navTextColor?: string;
    borderColor?: string;
    borderRadius?: number;
    logoUrl?: string;
    logoHeight?: number;
    heroUrl?: string;
    heroOpacity?: number;
    heroPosition?: string;
    customCss?: string;
    templateKey?: string;
}

export interface CommunityData {
    name: string;
    description: string;
    avatar: string;
    modules: any[];
}
