"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../utils/logger");
const whitelist = {
    id: 'whitelist',
    name: 'Sistema de Whitelist',
    category: 'Game Integration',
    init: (client) => {
        // Wait for FiveM API responses or WL form buttons
    },
    handleAction: async (action, params) => {
        if (action === 'approve_whitelist') {
            logger_1.log.info(`API: Aprovando membro no Jogo: ${params}`);
        }
    }
};
exports.default = whitelist;
