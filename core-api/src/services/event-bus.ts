import { EventEmitter } from 'events';

export class EventBus extends EventEmitter {
    constructor() {
        super();
        this.on('any', (eventName, payload) => {
            console.log(`[EVENT BUS] 📥 Evento: ${eventName}`, payload);
        });
    }

    emitEvent(eventName: string, payload: any) {
        this.emit(eventName, payload);
        this.emit('any', eventName, payload);
    }
}

export const eventBus = new EventBus();
