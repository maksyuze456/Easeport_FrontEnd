import { MessageHandler, WsTransport } from "../../_lib/ws/stompTransport"

export class FakeStompTransport implements WsTransport {
  private handler: MessageHandler | null = null
  private subscribedTopics = new Set<string>()
  private connected = false

  connect(): void {
    this.connected = true
  }

  disconnect(): void {
    this.connected = false
    this.subscribedTopics.clear()
  }

  subscribe(topic: string): void {
    this.subscribedTopics.add(topic)
  }

  onMessage(handler: MessageHandler): void {
    this.handler = handler
  }

  emit(topic: string, payload: string): void {
    if (!this.connected) throw new Error('Not connected')
    if (!this.subscribedTopics.has(topic)) {
      console.warn(`No subscription for topic: ${topic}`)
      return
    }
    this.handler?.(topic, payload)
  }
}