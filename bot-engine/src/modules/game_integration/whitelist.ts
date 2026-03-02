import { Client } from 'discord.js';
import { BaseModule } from '../BaseModule';
import { log } from '../../utils/logger';

const whitelist: BaseModule = {
    id: 'whitelist',
    name: 'Sistema de Whitelist',
    category: 'Game Integration',

    init: (client: Client) => {
        // Wait for FiveM API responses or WL form buttons
    },

    handleAction: async (action: string, params: any) => {
        if (action === 'approve_whitelist') {
            log.info(`API: Aprovando membro no Jogo: ${params}`);
        }
    }
};

export default whitelist;
