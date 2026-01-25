import { Client, IMessage, StompSubscription } from "@stomp/stompjs"
import SockJS from "sockjs-client"

export type MessageHandler = (topic: string, payload: string) => void

export class StompTransport {
    private client: Client
    private handler: MessageHandler | null = null
    private subscriptions = new Map<
        string,
        { cb: (msg: string) => void; sub?: StompSubscription }
    >()
    private connected = false

    constructor(private url: string) {
        this.client = new Client({
            webSocketFactory: () => new SockJS(url),
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            debug: (msg) => console.log("[STOMP]", msg)
        })

        this.client.onConnect = () => {
            this.connected = true

            this.subscriptions.forEach((entry, topic) => {
                if (entry.sub) return

                const stompSub = this.client.subscribe(topic, (msg: IMessage) => {
                    entry.cb(msg.body)
                })

                entry.sub = stompSub
            })
        }

        this.client.onDisconnect = () => {
            this.connected = false;
        }
    }

    connect() {
        if (this.client.active) return
        this.client.activate()
    }

    disconnect() {
        this.subscriptions.forEach((entry) => {
            entry.sub?.unsubscribe()
        })

        this.subscriptions.clear()
        this.client.deactivate()
    }

    isConnected() {
        return this.connected;
    }

    subscribe(topic: string, cb: (msg: string) => void) {
        if (this.subscriptions.has(topic)) return () => { }

        this.subscriptions.set(topic, { cb })

        if (!this.connected) return () => { }

        const stompSub = this.client.subscribe(topic, (msg: IMessage) => {
            cb(msg.body)
        })

        this.subscriptions.get(topic)!.sub = stompSub

        return () => {
            stompSub.unsubscribe()
            this.subscriptions.delete(topic)
        }
    }
}
