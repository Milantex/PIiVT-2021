import EventEmitter from "eventemitter3";

const eventRegister = new EventEmitter();

type EventType = "AUTH_EVENT" |
                 "CART_EVENT" ;

type EventHandler = (...args: any[]) => void;

const EventRegister = {
    on:   (event: EventType, handler: EventHandler) => eventRegister.on(event, handler),
    once: (event: EventType, handler: EventHandler) => eventRegister.once(event, handler),
    off:  (event: EventType, handler: EventHandler) => eventRegister.off(event, handler),
    emit: (event: EventType, ...data: any[])        => eventRegister.emit(event, ...data),
};

Object.freeze(EventRegister);

export default EventRegister;
