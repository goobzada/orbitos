import { Client } from 'discord.js';

export interface BaseModule {
    id: string; // The module database key (e.g., 'welcome_message', 'ticket')
    name: string;
    category: string; // Onboarding, Support, Engagement, Monetization, Security, Automation, Game Integration, Analytics
    init: (client: Client) => void;
    // For handling incoming WS events specific to this module
    handleAction?: (action: string, params: any) => Promise<void>;
    // For handling Discord interactions (buttons, selects, etc)
    handleInteraction?: (interaction: any) => Promise<void>;
}
