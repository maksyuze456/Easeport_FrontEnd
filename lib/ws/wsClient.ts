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

    connect() {
        if (this.transport) return

        const brokerURL = buildWsUrl(process.env.NEXT_PUBLIC_WS_URL)
        this.transport = new StompTransport(brokerURL)
        this.transport.connect()
    }

    subscribe(topic: string, cb: (msg: string) => void) {
        if (!this.transport) return () => { }
        return this.transport.subscribe(topic, cb)
    }

    disconnect() {
        if (!this.transport) return
        this.transport.disconnect()
        this.transport = null
    }

    isConnected() {
        return this.transport?.isConnected() ?? false
    }
}

export const wsClient = new WsClient()
