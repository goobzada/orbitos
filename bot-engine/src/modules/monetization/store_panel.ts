import { Client } from 'discord.js';
import { BaseModule } from '../BaseModule';
import { log } from '../../utils/logger';

const store_panel: BaseModule = {
    id: 'store_panel',
    name: 'Painel da Loja',
    category: 'Monetization',

    init: (client: Client) => {
        // Enviar os embed messages da loja
    },

    handleAction: async (action: string, params: any) => {
        if (action === 'send_store_embed') {
            log.info(`Enviando painel de loja via API: ${params}`);
        }
    }
};

export default store_panel;
