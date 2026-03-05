"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleLoader = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../utils/logger");
class ModuleLoader {
    client;
    modules = new Map();
    constructor(client) {
        this.client = client;
    }
    async loadModules() {
        const modulesPath = path_1.default.join(__dirname);
        const folders = fs_1.default.readdirSync(modulesPath).filter(f => fs_1.default.statSync(path_1.default.join(modulesPath, f)).isDirectory());
        for (const folder of folders) {
            const folderPath = path_1.default.join(modulesPath, folder);
            // Suporta .ts (dev/ts-node) e .js (produção compilada)
            const allFiles = fs_1.default.readdirSync(folderPath);
            const tsFiles = allFiles.filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'));
            const jsFiles = allFiles.filter(f => f.endsWith('.js') && !f.endsWith('.d.js'));
            const files = tsFiles.length > 0 ? tsFiles : jsFiles;
            for (const file of files) {
                try {
                    const moduleImport = require(path_1.default.join(folderPath, file)).default;
                    if (moduleImport && moduleImport.id) {
                        this.modules.set(moduleImport.id, moduleImport);
                        if (moduleImport.init) {
                            moduleImport.init(this.client);
                        }
                        logger_1.log.info(`[MODULE SERVER] 📦 Módulo carregado: ${moduleImport.name} (${folder}) [${file}]`);
                    }
                }
                catch (error) {
                    logger_1.log.error(`[MODULE SERVER] ❌ Falha ao carregar o módulo ${file}: ${error.message}`);
                }
            }
        }
    }
    getModule(id) {
        return this.modules.get(id);
    }
    getAllModules() {
        return Array.from(this.modules.values());
    }
    async dispatchAction(action, params) {
        // Find if any module can handle this action based on a prefix or some convention
        // Simple convention: action looks like "module_id.action_name"
        const [moduleId, ...actionParts] = action.split('.');
        const actionName = actionParts.join('.');
        if (moduleId && actionName) {
            const module = this.getModule(moduleId);
            if (module && module.handleAction) {
                await module.handleAction(actionName, params);
                return true;
            }
        }
        return false;
    }
    async getGuildModuleConfig(guildId, moduleKey) {
        try {
            const { data } = await require('../utils/api-client').default.get(`/internal/guilds/${guildId}/modules`);
            const modules = data.modules || [];
            const module = modules.find((m) => m.key === moduleKey);
            return module ? module.config : null;
        }
        catch (error) {
            logger_1.log.error(`[MODULE LOADER] Erro ao buscar config do módulo ${moduleKey}: ${error}`);
            return null;
        }
    }
    async handleInteraction(interaction) {
        for (const module of this.modules.values()) {
            if (module.handleInteraction) {
                try {
                    await module.handleInteraction(interaction);
                }
                catch (e) {
                    logger_1.log.error(`[MODULE LOADER] Erro ao processar interação no módulo ${module.id}: ${e}`);
                }
            }
        }
    }
}
exports.ModuleLoader = ModuleLoader;
