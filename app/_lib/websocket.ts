import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let sharedClient: Client | null = null;
let connectionPromise: Promise<Client> | null = null;

export function getWebSocketClient(apiUrl: string): Promise<Client> {
    if (sharedClient?.connected) {
        return Promise.resolve(sharedClient);
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = new Promise((resolve, reject) => {
        const client = new Client({
            webSocketFactory: () => new SockJS(`${apiUrl}/ws`),
            reconnectDelay: 10000,
            debug: (msg) => console.log('[STOMP]', msg),

            onConnect: () => {
                console.log("Websocket connected");
                sharedClient = client;
                connectionPromise = null;
                resolve(client);
            },

            onStompError: (frame) => {
                console.error("WebSocket error:", frame);
                connectionPromise = null;
                reject(frame);
            }
        });

        client.activate();
    });

    return connectionPromise;
}