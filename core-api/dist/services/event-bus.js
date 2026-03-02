"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBus = exports.EventBus = void 0;
const events_1 = require("events");
class EventBus extends events_1.EventEmitter {
    constructor() {
        super();
        this.on('any', (eventName, payload) => {
            console.log(`[EVENT BUS] 📥 Evento: ${eventName}`, payload);
        });
    }
    emitEvent(eventName, payload) {
        this.emit(eventName, payload);
        this.emit('any', eventName, payload);
    }
}
exports.EventBus = EventBus;
exports.eventBus = new EventBus();
