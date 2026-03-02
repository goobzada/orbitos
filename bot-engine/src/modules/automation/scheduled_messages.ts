import { Client } from 'discord.js';
import { BaseModule } from '../BaseModule';
import { log } from '../../utils/logger';

const scheduled_messages: BaseModule = {
    id: 'scheduled_messages',
    name: 'Mensagens Agendadas',
    category: 'Automation',

    init: (client: Client) => {
        // Inicializar loops se houver
    },

    handleAction: async (action: string, params: any) => {
        // Dashboard can trigger a schedule instantly or refresh
        if (action === 'trigger_message') {
            log.info(`Enviando mensagem agendada agora: ${params}`);
        }
    }
};

export default scheduled_messages;
