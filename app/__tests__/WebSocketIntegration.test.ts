import { FakeStompTransport } from './mocks/FakeWsClient'
import { WsBus } from '../_lib/ws/wsBus'

describe('WebSocket Integration', () => {
  it('dispatches messages from transport to bus subscribers', () => {
    const transport = new FakeStompTransport()
    const bus = new WsBus()
    const callback = jest.fn()

    transport.onMessage((topic, payload) => {
      bus.dispatch(topic, payload)
    })

    transport.connect()
    transport.subscribe('/topic/tickets')
    bus.subscribe('/topic/tickets', callback)

    transport.emit('/topic/tickets', JSON.stringify({ id: 2, name: 'Maja' }))

    expect(callback).toHaveBeenCalledWith(JSON.stringify({ id: 2, name: 'Maja' }))
  })
})