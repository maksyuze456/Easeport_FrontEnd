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
            this.activateSubscriptions()
        }

        this.client.onDisconnect = () => {
            this.connected = false
            this.clearStaleSubscriptions()
        }

        this.client.onStompError = (frame) => {
            console.error("[STOMP] Error:", frame.headers["message"], frame.body)
        }

        this.client.onWebSocketClose = () => {
            this.connected = false
            this.clearStaleSubscriptions()
        }
    }

    private activateSubscriptions() {
        this.subscriptions.forEach((entry, topic) => {
            if (entry.sub) return

            const stompSub = this.client.subscribe(topic, (msg: IMessage) => {
                entry.cb(msg.body)
            })

            entry.sub = stompSub
        })
    }

    private clearStaleSubscriptions() {
        this.subscriptions.forEach((entry) => {
            entry.sub = undefined
        })
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
        // If topic already exists, unsubscribe the old one first so we can
        // replace it with a fresh callback (handles re-mounts cleanly)
        const existing = this.subscriptions.get(topic)
        if (existing?.sub) {
            existing.sub.unsubscribe()
        }

        this.subscriptions.set(topic, { cb })

        // If already connected, subscribe to STOMP immediately
        if (this.connected) {
            const stompSub = this.client.subscribe(topic, (msg: IMessage) => {
                cb(msg.body)
            })
            this.subscriptions.get(topic)!.sub = stompSub
        }
        // If not connected yet, onConnect will pick it up from the map

        return () => {
            const entry = this.subscriptions.get(topic)
            if (entry) {
                entry.sub?.unsubscribe()
                this.subscriptions.delete(topic)
            }
        }
    }
}
