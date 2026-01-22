import { Client, IMessage } from "@stomp/stompjs"
import SockJS from "sockjs-client"

export type MessageHandler = (topic: string, payload: string) => void

export interface WsTransport {
  connect(): void
  disconnect(): void
  subscribe(topic: string): void
  onMessage(handler: MessageHandler): void
}

export class StompTransport implements WsTransport {
  private client: Client
  private handler: MessageHandler | null = null
  private subscribedTopics = new Set<string>()

  constructor(private url: string) {
    this.client = new Client({
      webSocketFactory: () => new SockJS(url),
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg) => console.log("[STOMP]", msg),
    })

    this.client.onConnect = () => {
      this.subscribedTopics.forEach((topic) => {
        this.subscribe(topic)
      })
    }
  }

  onMessage(handler: MessageHandler) {
    this.handler = handler
  }

  connect() {
    this.client.activate()
  }

  disconnect() {
    this.client.deactivate()
  }

  subscribe(topic: string) {
    if (this.subscribedTopics.has(topic)) return

    this.subscribedTopics.add(topic)

    if (!this.client.connected) return

    this.client.subscribe(topic, (msg: IMessage) => {
      this.handler?.(topic, msg.body)
    })
  }
}