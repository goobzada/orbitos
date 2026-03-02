/**
 * Theme Engine – Community OS V1
 * Converte tokens de identidade (OrganizationTemplate) + config do preset
 * num objeto de theme pronto para injetar via CSS vars ou React Context.
 */

export interface ThemeTokens {
    colors: {
        primary: string;
        secondary: string;
        background: string;
        surface: string;
        navBackground: string;
        navTextColor: string;
        cardBackground: string;
        borderColor: string;
        buttonTextColor: string;
        text: string;
        heroText: string;
    };
    typography: {
        fontFamily: string;
        fontSize: number;
        fontWeight: string;
    };
    radius: number;
    logoUrl: string | null;
    logoHeight: number;
    darkMode: boolean;
    // Layout fields (from preset config)
    layoutType: string;
    navigation: string;
    heroMode: string;
    backgroundPattern: string;
    cardShape: string;
    fontPreset: string;
    // Hero & Custom
    heroUrl: string | null;
    heroOpacity: number;
    heroPosition: string;
    customCss: string | null;
}

const isValidHex = (hex: string) => /^#([0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(hex);
const sanitizeColor = (color: string | undefined | null, fallback: string) => {
    if (!color) return fallback;
    if (color === 'transparent' || color.startsWith('rgba') || color.startsWith('rgb')) return color;
    return isValidHex(color) ? color : fallback;
};

export function buildTheme(
    identity: Record<string, any> | null,
    preset: { config: Record<string, any> } | null
): ThemeTokens {
    const config = preset?.config ?? {};

    return {
        colors: {
            primary: sanitizeColor(identity?.primaryColor, '#6366F1'),
            secondary: sanitizeColor(identity?.secondaryColor, '#8B5CF6'),
            background: sanitizeColor(identity?.backgroundColor, '#020617'),
            surface: sanitizeColor(identity?.surfaceColor, '#0B1120'),
            navBackground: sanitizeColor(identity?.navBackground, '#0D1117'),
            navTextColor: sanitizeColor(identity?.navTextColor, '#F9FAFB'),
            cardBackground: sanitizeColor(identity?.cardBackground, '#111827'),
            borderColor: sanitizeColor(identity?.borderColor, 'rgba(255,255,255,0.08)'),
            buttonTextColor: sanitizeColor(identity?.buttonTextColor, '#FFFFFF'),
            text: sanitizeColor(identity?.textColor, '#F9FAFB'),
            heroText: sanitizeColor(identity?.heroTextColor, '#FFFFFF'),
        },
        typography: {
            fontFamily: identity?.fontFamily ?? 'Inter, sans-serif',
            fontSize: identity?.fontSizeBasePx ?? 14,
            fontWeight: identity?.fontWeight ?? '400',
        },
        radius: identity?.borderRadiusPx ?? 12,
        logoUrl: identity?.logoUrl ?? null,
        logoHeight: identity?.logoHeightPx ?? 40,
        darkMode: identity?.darkModeDefault ?? true,
        // Layout - sempre vem do preset, não da identity
        layoutType: config.layoutType ?? 'dashboard-sidebar',
        navigation: config.navigation ?? 'sidebar',
        heroMode: config.heroMode ?? 'small',
        backgroundPattern: config.backgroundPattern ?? 'none',
        cardShape: config.cardShape ?? 'rounded',
        fontPreset: config.fontPreset ?? 'default',
        // Hero & Custom
        heroUrl: identity?.heroImageUrl ?? null,
        heroOpacity: identity?.heroOpacity ?? 80,
        heroPosition: identity?.heroPosition ?? '50% 50%',
        customCss: identity?.customCss ?? null,
    };
}

/** Converte ThemeTokens para CSS Variables stringificadas */
export function themeToCSS(theme: ThemeTokens): string {
    return `
    /* Shadcn / Tailwind 4 Base Vias (Mapeia para os componentes da UI) */
    --primary: ${theme.colors.primary};
    --background: ${theme.colors.background};
    --card: ${theme.colors.cardBackground};
    --border: ${theme.colors.borderColor};
    --secondary: ${theme.colors.secondary};
    --accent: ${theme.colors.surface};
    --foreground: ${theme.colors.text};
    --muted: ${theme.colors.surface};
    --radius: ${theme.radius}px;

    /* Community OS Legacy / Specific Vars */
    --color-primary: ${theme.colors.primary};
    --color-secondary: ${theme.colors.secondary};
    --color-background: ${theme.colors.background};
    --color-surface: ${theme.colors.surface};
    --color-nav-bg: ${theme.colors.navBackground};
    --color-nav-text: ${theme.colors.navTextColor};
    --color-card-bg: ${theme.colors.cardBackground};
    --color-border: ${theme.colors.borderColor};
    --color-btn-text: ${theme.colors.buttonTextColor};
    --color-text: ${theme.colors.text};
    --color-hero-text: ${theme.colors.heroText};
    --font-family: ${theme.typography.fontFamily};
    --font-size-base: ${theme.typography.fontSize}px;
    --font-weight-base: ${theme.typography.fontWeight};
    /* Hero */
    --hero-url: url(${theme.heroUrl ? `"${theme.heroUrl}"` : 'none'});
    --hero-opacity: ${theme.heroOpacity / 100};
    --hero-pos: ${theme.heroPosition};
  `.trim();
}
