// lib/ws/wsClient.ts
import { StompTransport } from "./StompTransport"

function buildWsUrl(base: string | undefined): string {
    const raw = base ?? "ws://localhost:8080"
    const wsUrl = raw
        .replace(/^https:\/\//, "wss://")
        .replace(/^http:\/\//, "ws://")
    return `${wsUrl}/ws`
}

class WsClient {
    private transport: StompTransport | null = null
    private pendingSubs: Array<{ topic: string; cb: (msg: string) => void }> = []

    connect() {
        if (this.transport) return

        const brokerURL = buildWsUrl(process.env.NEXT_PUBLIC_WS_URL)
        this.transport = new StompTransport(brokerURL)

        // Flush any subscriptions that were registered before connect()
        for (const { topic, cb } of this.pendingSubs) {
            this.transport.subscribe(topic, cb)
        }
        this.pendingSubs = []

        this.transport.connect()
    }

    subscribe(topic: string, cb: (msg: string) => void) {
        if (!this.transport) {
            // Queue the subscription — it will be flushed when connect() runs
            this.pendingSubs.push({ topic, cb })
            return () => {
                this.pendingSubs = this.pendingSubs.filter(
                    (s) => s.topic !== topic || s.cb !== cb
                )
            }
        }
        return this.transport.subscribe(topic, cb)
    }

    disconnect() {
        if (!this.transport) return
        this.transport.disconnect()
        this.transport = null
        this.pendingSubs = []
    }

    isConnected() {
        return this.transport?.isConnected() ?? false
    }
}

export const wsClient = new WsClient()
