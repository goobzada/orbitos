"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../utils/logger");
const store_panel = {
    id: 'store_panel',
    name: 'Painel da Loja',
    category: 'Monetization',
    init: (client) => {
        // Enviar os embed messages da loja
    },
    handleAction: async (action, params) => {
        if (action === 'send_store_embed') {
            logger_1.log.info(`Enviando painel de loja via API: ${params}`);
        }
    }
};
exports.default = store_panel;
