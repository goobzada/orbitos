import React from 'react';
import { TemplateConfig, CommunityData } from './types';
import { DashboardSidebarLayout } from './layouts/DashboardSidebarLayout';
import { TopNavGlassLayout } from './layouts/TopNavGlassLayout';
import { TerminalLayout } from './layouts/TerminalLayout';
import { LandingAuroraLayout } from './layouts/LandingAuroraLayout';
import { BlocksLayout } from './layouts/BlocksLayout';

interface Props {
    config: TemplateConfig;
    community: CommunityData;
}

export function CommunityPortal({ config, community }: Props) {
    // O motor React roteia para o Componente de Layout correto baseado no templateKey ou layoutType
    // garantindo que não estamos apenas "trocando cores num fundo branco".

    switch (config.layoutType) {
        case 'dashboard-sidebar':
            return <DashboardSidebarLayout config={config} community={community} />;

        case 'dashboard-topnav':
            return <TopNavGlassLayout config={config} community={community} />;

        case 'marketing-landing':
            return <LandingAuroraLayout config={config} community={community} />;

        case 'terminal':
            return <TerminalLayout config={config} community={community} />;

        case 'blocks':
            return <BlocksLayout config={config} community={community} />;

        default:
            // Fallback para o modo Free 'default-classic'
            return <DashboardSidebarLayout config={config} community={community} />;
    }
}
