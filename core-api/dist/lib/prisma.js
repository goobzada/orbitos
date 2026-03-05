"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
/* FIX C5: singleton global — evita múltiplas conexões em hot-reload */
const globalForPrisma = global;
exports.prisma = globalForPrisma.prisma ?? new client_1.PrismaClient({ log: ['warn', 'error'] });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
exports.default = exports.prisma;
