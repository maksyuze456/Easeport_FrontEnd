// lib/ws/wsClient.ts
import { StompTransport } from "./StompTransport"

class WsClient {
    private transport: StompTransport | null = null
    private connected = false

    connect() {
        if (this.connected) return

        this.transport = new StompTransport(
            `${process.env.NEXT_PUBLIC_API_URL}/ws`
        )

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
        this.connected = false
    }

    isConnected() {
        return this.transport?.isConnected
    }
}

export const wsClient = new WsClient()
