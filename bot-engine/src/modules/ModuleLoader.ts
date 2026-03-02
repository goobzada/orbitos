import { Client } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { log } from '../utils/logger';
import { BaseModule } from './BaseModule';

export class ModuleLoader {
    private client: Client;
    private modules: Map<string, BaseModule> = new Map();

    constructor(client: Client) {
        this.client = client;
    }

    async loadModules() {
        const modulesPath = path.join(__dirname);
        const folders = fs.readdirSync(modulesPath).filter(f => fs.statSync(path.join(modulesPath, f)).isDirectory());

        for (const folder of folders) {
            const folderPath = path.join(modulesPath, folder);
            const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'));

            for (const file of files) {
                try {
                    const moduleImport = require(path.join(folderPath, file)).default as BaseModule;
                    if (moduleImport && moduleImport.id) {
                        this.modules.set(moduleImport.id, moduleImport);
                        if (moduleImport.init) {
                            moduleImport.init(this.client);
                        }
                        log.info(`[MODULE SERVER] 📦 Módulo carregado: ${moduleImport.name} (${folder})`);
                    }
                } catch (error: any) {
                    log.error(`[MODULE SERVER] ❌ Falha ao carregar o módulo ${file}: ${error.message}`);
                }
            }
        }
    }

    getModule(id: string): BaseModule | undefined {
        return this.modules.get(id);
    }

    getAllModules() {
        return Array.from(this.modules.values());
    }

    async dispatchAction(action: string, params: any) {
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

    async getGuildModuleConfig(guildId: string, moduleKey: string) {
        try {
            const { data } = await require('../utils/api-client').default.get(`/internal/guilds/${guildId}/modules`);
            const modules = data.modules || [];
            const module = modules.find((m: any) => m.key === moduleKey);
            return module ? module.config : null;
        } catch (error) {
            log.error(`[MODULE LOADER] Erro ao buscar config do módulo ${moduleKey}: ${error}`);
            return null;
        }
    }

    async handleInteraction(interaction: any) {
        for (const module of this.modules.values()) {
            if (module.handleInteraction) {
                try {
                    await module.handleInteraction(interaction);
                } catch (e) {
                    log.error(`[MODULE LOADER] Erro ao processar interação no módulo ${module.id}: ${e}`);
                }
            }
        }
    }
}
