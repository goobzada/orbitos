"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../utils/logger");
const scheduled_messages = {
    id: 'scheduled_messages',
    name: 'Mensagens Agendadas',
    category: 'Automation',
    init: (client) => {
        // Inicializar loops se houver
    },
    handleAction: async (action, params) => {
        // Dashboard can trigger a schedule instantly or refresh
        if (action === 'trigger_message') {
            logger_1.log.info(`Enviando mensagem agendada agora: ${params}`);
        }
    }
};
exports.default = scheduled_messages;
