// src/stompService.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class StompService {
    constructor(url) {
        this.client = null;
        this.callbacks = {};
        this.isConnect = false;
        if (url) {
            this.connect(url);
        }
    }

    connect(url) {
        this.client = new Client({
            webSocketFactory: () => {
                return new SockJS(url);
            },
            debug: (str) => { console.log(str); },
            onConnect: () => {
                console.log('Conectado a WebSocket');
                this.isConnect = true;
                this.processSubscriptions();
            },
            onStompError: (frame) => {
                console.error('Error en STOMP: ' + frame.headers['message']);
            },
        });

        this.client.activate(); // Activa el cliente STOMP
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
        }
    }

    unsubscribe(destination) {
        if (this.callbacks[destination] && this.isConnect) {
            delete this.callbacks[destination];
            this.client.unsubscribe(destination);
        }
    }

    subscribe(destination, callback) {
        return new Promise((resolve, reject) => {
            this.callbacks[destination] = callback;
            if (this.isConnect) {
                this.client.subscribe(destination, (msg) => {
                    const message = JSON.parse(msg.body);
                    callback(message);
                });
                resolve();
            }else{
                reject('No conectado');
            }
        });
    }

    processSubscriptions() {
        if (!this.isConnect) {
            return;
        }

        Object.keys(this.callbacks).forEach((destination) => {
            this.client.subscribe(destination, (msg) => {
                const message = JSON.parse(msg.body);
                this.callbacks[destination](message);
            });
        });
    }

    publish(destination, message) {
        this.client.publish({ destination, body: JSON.stringify(message) });
    }
}

const stompService = new StompService('http://localhost:8080/ws-connect-sj');
export default stompService;