import { Client, IMessage, StompSubscription } from "@stomp/stompjs"

export type MessageHandler = (topic: string, payload: string) => void

export class StompTransport {
    private client: Client
    private handler: MessageHandler | null = null
    private subscriptions = new Map<
        string,
        { cb: (msg: string) => void; sub?: StompSubscription }
    >()
    private connected = false

    constructor(private brokerURL: string) {
        this.client = new Client({
            brokerURL,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            reconnectDelay: 5000,
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

        this.client.onStompError = (frame) => {
            console.error("[STOMP] Error:", frame.headers["message"], frame.body)
        }

        this.client.onWebSocketClose = () => {
            this.connected = false
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
